/* eslint-disable @typescript-eslint/no-explicit-any */
export type PayloadConstructor = abstract new (...args: any[]) => any;

import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';
import { EMPTY_BUFFER } from '../constants';

/**
 * Metadata key used to store field definitions on the class constructor.
 */
const METADATA_KEY = Symbol.for('BoksPayloadMapper');

export type FieldType =
  | 'uint8'
  | 'uint16'
  | 'uint24'
  | 'uint32'
  | 'ascii_string'
  | 'mac_address'
  | 'hex_string'
  | 'pin_code'
  | 'config_key'
  | 'boolean'
  | 'byte_array'
  | 'var_len_hex'
  | 'bit';

export interface FieldDefinition {
  propertyName: string;
  type: FieldType;
  offset: number;
  length?: number; // Optional for hex_string and byte_array to consume remaining bytes
  bitIndex?: number; // Required for 'bit'
}

/**
 * Ensures the target class has a metadata array for field definitions.
 */

const legacyMetadataMap = new WeakMap<PayloadConstructor, FieldDefinition[]>();

export function getOrCreateMetadata(
  context: ClassAccessorDecoratorContext<unknown, unknown>
): FieldDefinition[] {
  if (context.metadata) {
    if (!context.metadata[METADATA_KEY]) {
      context.metadata[METADATA_KEY] = [];
    } else if (!Object.prototype.hasOwnProperty.call(context.metadata, METADATA_KEY)) {
      // It's inherited from a parent! We must clone it so we don't mutate the parent's schema!
      context.metadata[METADATA_KEY] = [...(context.metadata[METADATA_KEY] as FieldDefinition[])];
    }
    return context.metadata[METADATA_KEY] as FieldDefinition[];
  }
  /* v8 ignore next */
  return [];
}

/**
 * Core Payload Mapper utility.
 * Compiles and executes JIT (Just-In-Time) parsing functions for extreme performance.
 */
export class PayloadMapper {
  // Cache of compiled parsing functions, keyed by Class Constructor
  private static compiledParsers = new WeakMap<PayloadConstructor, (...args: any[]) => any>();
  // Cache of compiled serialization functions
  private static compiledSerializers = new WeakMap<PayloadConstructor, (...args: any[]) => any>();
  private static compiledValidators = new WeakMap<PayloadConstructor, (...args: any[]) => any>();

  /**
   * Pre-computed hex table for JIT compilers
   */
  private static readonly HEX_TABLE = Array.from({ length: 256 }, (_, i) =>
    i.toString(16).padStart(2, '0').toUpperCase()
  );

  /**
   * Pre-computed 16-bit hex lookup table (4 chars) to process 2 bytes per iteration
   */
  private static readonly HEX_TABLE_16 = (() => {
    const table = new Array<string>(65536);
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 256; j++) {
        table[(i << 8) | j] = PayloadMapper.HEX_TABLE[i] + PayloadMapper.HEX_TABLE[j];
      }
    }
    return table;
  })();

  /**
   * Security check: Validates that property names are safe identifiers
   * to prevent code injection into the JIT compiler via new Function().
   */

  /**
   * Fast, regex-free validation of JavaScript identifiers.
   * Ensures the name only contains [a-zA-Z0-9_$] and doesn't start with a number.
   */
  private static isValidIdentifier(name: string): boolean {
    if (!name || name.length === 0) {
      return false;
    }

    // First char cannot be a number
    const firstCode = name.charCodeAt(0);
    const isFirstValid =
      (firstCode >= 65 && firstCode <= 90) || // A-Z
      (firstCode >= 97 && firstCode <= 122) || // a-z
      firstCode === 36 || // $
      firstCode === 95; // _

    if (!isFirstValid) {
      return false;
    }

    // Subsequent chars can also be numbers
    for (let i = 1; i < name.length; i++) {
      const code = name.charCodeAt(i);
      const isValid =
        (code >= 48 && code <= 57) || // 0-9
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        code === 36 || // $
        code === 95; // _

      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  private static assertSafePropertyName(name: string): void {
    const dangerousNames = [
      '__proto__',
      'constructor',
      'prototype',
      'payload',
      'instance',
      'HEX_TABLE',
      'BoksProtocolError',
      'BoksProtocolErrorId',
      'result',
      'break',
      'case',
      'catch',
      'class',
      'const',
      'continue',
      'debugger',
      'default',
      'delete',
      'do',
      'else',
      'export',
      'extends',
      'finally',
      'for',
      'function',
      'if',
      'import',
      'in',
      'instanceof',
      'new',
      'return',
      'super',
      'switch',
      'this',
      'throw',
      'try',
      'typeof',
      'var',
      'void',
      'while',
      'with',
      'yield',
      'let',
      'static',
      'enum',
      'await',
      'implements',
      'package',
      'protected',
      'interface',
      'private',
      'public'
    ];
    // Must be a valid identifier and not a reserved word or internal JIT variable
    if (
      typeof name !== 'string' ||
      !PayloadMapper.isValidIdentifier(name) ||
      dangerousNames.includes(name)
    ) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INTERNAL_ERROR,
        `Unsafe property name mapped: ${name}`,
        { received: name, expected: BoksExpectedReason.VALID_HEX_CHAR }
      );
    }
  }

  /**
   * Security check: Validates bounds to prevent integer overflows
   * or unreasonable memory access definitions in the decorators.
   */
  public static assertSafeBounds(offset: number, size: number): void {
    if (
      typeof offset !== 'number' ||
      typeof size !== 'number' ||
      offset < 0 ||
      size < 0 ||
      !Number.isSafeInteger(offset) ||
      !Number.isSafeInteger(size) ||
      offset + size > 1024
    ) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.BUFFER_OVERFLOW,
        `Invalid mapping bounds: offset=${offset}, size=${size}`,
        { received: offset + size, expected: 1024 }
      );
    }
  }

  /**
   * Compiles the JIT parsing function for a class.
   */

  public static getFields(targetClass: PayloadConstructor | unknown): FieldDefinition[] {
    const allFields: FieldDefinition[] = [];
    let currentClass = targetClass;
    while (
      currentClass &&
      currentClass !== Function.prototype &&
      currentClass !== Object.prototype
    ) {
      let symMetadata: symbol | undefined = Symbol.metadata;

      if (!symMetadata) {
        const symbols = Object.getOwnPropertySymbols(currentClass);
        symMetadata = symbols.find((s) => s.toString() === 'Symbol(Symbol.metadata)');
      }
      const fields =
        (symMetadata &&
          (currentClass as Record<PropertyKey, any>)[symMetadata as any]?.[METADATA_KEY]) ||
        (currentClass as Record<PropertyKey, any>)[Symbol.metadata as any]?.[METADATA_KEY] ||
        (currentClass.constructor as Record<PropertyKey, any>)?.[Symbol.metadata as any]?.[
          METADATA_KEY
        ] ||
        legacyMetadataMap.get(currentClass as any) ||
        (currentClass as Record<PropertyKey, any>)[METADATA_KEY] ||
        (currentClass.constructor as Record<PropertyKey, any>)?.[METADATA_KEY];

      if (fields && Array.isArray(fields)) {
        // Add fields that aren't already mapped
        for (const f of fields) {
          if (!allFields.find((existing) => existing.propertyName === f.propertyName)) {
            allFields.push(f);
          }
        }
      }
      currentClass = Object.getPrototypeOf(currentClass);
    }

    return allFields;
  }

  private static compileParser(targetClass: PayloadConstructor): (...args: any[]) => any {
    const fields = this.getFields(targetClass);

    if (!fields || fields.length === 0) {
      return (_payload: Uint8Array) => ({}); // No fields mapped
    }

    // Calculate maximum required payload size securely
    let minSize = 0;
    for (const field of fields) {
      this.assertSafePropertyName(field.propertyName);

      let size = 1; // Default min size
      if (field.type === 'uint16') {
        size = 2;
      } else if (field.type === 'uint24') {
        size = 3;
      } else if (field.type === 'uint32') {
        size = 4;
      } else if (field.type === 'mac_address') {
        size = 6;
      } else if (field.type === 'pin_code') {
        size = 6;
      } else if (field.type === 'config_key') {
        size = 8;
      } else if (field.type === 'ascii_string') {
        if (typeof field.length !== 'number') {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INTERNAL_ERROR,
            `Length required for string type: ${field.type} on property ${field.propertyName}`,
            { field: field.propertyName, received: typeof field.length, expected: 'number' }
          );
        }
        size = field.length;
      } else if (field.type === 'hex_string' || field.type === 'byte_array') {
        if (typeof field.length === 'number') {
          size = field.length;
        } else {
          size = 0; // Dynamic length, min size is just the offset
        }
      } else if (field.type === 'var_len_hex') {
        size = 1; // At minimum we need 1 byte for length
      } else if (field.type === 'bit') {
        size = 1;
      }

      this.assertSafeBounds(field.offset, size);

      const endOffset = field.offset + size;
      if (endOffset > minSize) {
        minSize = endOffset;
      }
    }

    // Start building the Javascript function body as a string.
    // We explicitly throw a BoksProtocolError if the payload is too short,
    // which handles the "fuzzing malformed data" requirement.
    let fnBody = `
      // Auto-generated by PayloadMapper
      if (!(payload instanceof Uint8Array)) {
         throw new BoksProtocolError(
           BoksProtocolErrorId.INVALID_TYPE,
           'Payload must be a Uint8Array',
           { received: typeof payload, expected: 'Uint8Array' }
         );
      }
      if (payload.length < ${minSize}) {
         throw new BoksProtocolError(
           BoksProtocolErrorId.MALFORMED_DATA,
           'Payload too short for mapped fields',
           { received: payload.length, expected: ${minSize} }
         );
      }
      const result = {};
    `;

    // Generate optimized extraction code for each field
    for (const field of fields) {
      const o = field.offset;
      const prop = field.propertyName;

      if (field.type === 'bit') {
        if (typeof field.bitIndex !== 'number' || field.bitIndex < 0 || field.bitIndex > 7) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INTERNAL_ERROR,
            `Invalid bitIndex: ${field.bitIndex} for property ${prop}`,
            { field: prop, received: field.bitIndex, expected: BoksExpectedReason.BIT_INDEX }
          );
        }
      }

      switch (field.type) {
        case 'uint8':
          fnBody += `result['${prop}'] = payload[${o}];\n`;
          break;
        case 'uint16':
          // Big Endian parsing
          fnBody += `result['${prop}'] = (payload[${o}] << 8) | payload[${o + 1}];\n`;
          break;
        case 'uint24':
          // Big Endian parsing
          fnBody += `result['${prop}'] = (payload[${o}] << 16) | (payload[${o + 1}] << 8) | payload[${o + 2}];\n`;
          break;
        case 'uint32':
          // Big Endian parsing (Note: >>> 0 ensures unsigned 32-bit result in JS)
          fnBody += `result['${prop}'] = ((payload[${o}] << 24) | (payload[${o + 1}] << 16) | (payload[${o + 2}] << 8) | payload[${o + 3}]) >>> 0;\n`;
          break;
        case 'ascii_string': {
          // Unrolled String.fromCharCode for fast ASCII extraction without Regex allocation
          // Encapsulated in a block scope to avoid variable name collisions or syntax errors
          fnBody += `
          {
             let s = '';
             let c;
          `;
          for (let i = 0; i < field.length!; i++) {
            fnBody += `
             c = payload[${o + i}];
             if (c) s += String.fromCharCode(c);
            `;
          }
          fnBody += `
             result['${prop}'] = s;
          }
          `;
          break;
        }
        case 'boolean':
          fnBody += `
               if (payload[${o}] !== 0x00 && payload[${o}] !== 0x01) {
                  throw new BoksProtocolError(
                    BoksProtocolErrorId.INVALID_VALUE,
                    'Boolean field must be 0x00 or 0x01',
                    { field: '${prop}', received: payload[${o}], expected: BoksExpectedReason.UINT8 }
                  );
               }
               result['${prop}'] = payload[${o}] === 0x01;
          `;
          break;
        case 'byte_array':
          if (typeof field.length === 'number') {
            fnBody += `result['${prop}'] = payload.subarray(${o}, ${o} + ${field.length});\n`;
          } else {
            fnBody += `result['${prop}'] = payload.subarray(${o});\n`;
          }
          break;
        case 'mac_address':
          // Reverse Little Endian to Big Endian (Standard Format: XX:XX:XX:XX:XX:XX)
          fnBody += `
            result['${prop}'] =
              HEX_TABLE[payload[${o + 5}]] + ':' +
              HEX_TABLE[payload[${o + 4}]] + ':' +
              HEX_TABLE[payload[${o + 3}]] + ':' +
              HEX_TABLE[payload[${o + 2}]] + ':' +
              HEX_TABLE[payload[${o + 1}]] + ':' +
              HEX_TABLE[payload[${o}]];
          `;
          break;
        case 'pin_code':
          // Inline validation for 6-char PIN: '0'-'9', 'A', 'B' (ASCII 48-57, 65-66)
          fnBody += `
             for(let i=0; i<6; i++) {
               const c = payload[${o} + i];
               if ((c < 48 || c > 57) && c !== 65 && c !== 66 && c !== 97 && c !== 98) {
                  throw new BoksProtocolError(
                    BoksProtocolErrorId.INVALID_PIN_FORMAT,
                    'Invalid PIN character inline',
                    { field: '${prop}', received: c, expected: BoksExpectedReason.VALID_HEX_CHAR }
                  );
               }
             }
             result['${prop}'] = String.fromCharCode(payload[${o}], payload[${o + 1}], payload[${o + 2}], payload[${o + 3}], payload[${o + 4}], payload[${o + 5}]).toUpperCase();
           `;
          break;
        case 'config_key':
          // Inline validation for 8-char Config Key (Hex: 0-9, A-F)
          fnBody += `
             for(let i=0; i<8; i++) {
               const c = payload[${o} + i];
               // '0'-'9' (48-57), 'A'-'F' (65-70), 'a'-'f' (97-102)

          if ((c < 48 || c > 57) && (c < 65 || c > 70) && (c < 97 || c > 102)) {
                  throw new BoksProtocolError(
                    BoksProtocolErrorId.INVALID_CONFIG_KEY,
                    'Invalid Config Key character inline',
                    { field: '${prop}', received: c, expected: BoksExpectedReason.VALID_HEX_CHAR }
                  );
               }
             }
             result['${prop}'] = String.fromCharCode(payload[${o}], payload[${o + 1}], payload[${o + 2}], payload[${o + 3}], payload[${o + 4}], payload[${o + 5}], payload[${o + 6}], payload[${o + 7}]).toUpperCase();
           `;
          break;
        case 'hex_string': {
          if (typeof field.length === 'number') {
            const hexArgs = [];
            for (let i = 0; i < field.length - 1; i += 2) {
              hexArgs.push(`HEX_TABLE_16[(payload[${o + i}] << 8) | payload[${o + i + 1}]]`);
            }
            if (field.length % 2 !== 0) {
              hexArgs.push(`HEX_TABLE[payload[${o + field.length - 1}]]`);
            }
            if (hexArgs.length > 0) {
              fnBody += `result['${prop}'] = ${hexArgs.join(' + ')};\n`;
            } else {
              fnBody += `result['${prop}'] = '';\n`;
            }
          } else {
            fnBody += `
            {
               let s = '';
               let i = ${o};
               for (; i <= payload.length - 2; i += 2) {
                 s += HEX_TABLE_16[(payload[i] << 8) | payload[i + 1]];
               }
               if (i < payload.length) {
                 s += HEX_TABLE[payload[i]];
               }
               result['${prop}'] = s;
            }
            `;
          }
          break;
        }
        case 'var_len_hex': {
          fnBody += `
          {
             const len = payload[${o}];
             if (payload.length < ${o + 1} + len) {
               throw new BoksProtocolError(
                 BoksProtocolErrorId.MALFORMED_DATA,
                 'Payload too short for variable length hex string',
                 { field: '${prop}', received: payload.length, expected: ${o + 1} + len }
               );
             }
             let s = '';
             let i = 0;
             for (; i <= len - 2; i += 2) {
               s += HEX_TABLE_16[(payload[${o + 1} + i] << 8) | payload[${o + 1} + i + 1]];
             }
             if (i < len) {
               s += HEX_TABLE[payload[${o + 1} + i]];
             }
             result['${prop}'] = s;
          }
          `;
          break;
        }
        case 'bit': {
          fnBody += `result['${prop}'] = ((payload[${o}] >> ${field.bitIndex!}) & 1) === 1;\n`;
          break;
        }
      }
    }

    fnBody += `return result;\n`;

    // Compile the function, injecting external dependencies into the closure scope.
    return new Function(
      'payload',
      'BoksProtocolError',
      'BoksProtocolErrorId',
      'BoksExpectedReason',
      'HEX_TABLE',
      'HEX_TABLE_16',
      fnBody
    ) as (...args: any[]) => any;
  }

  /**
   * Compiles the JIT serialization function for a class.
   */

  /**
   * Compiles the JIT validation function for a class instance.
   * Used in constructors to validate manually provided properties.
   */
  private static compileValidator(targetClass: PayloadConstructor): (...args: any[]) => any {
    const fields = this.getFields(targetClass);

    if (!fields || fields.length === 0) {
      return (_instance: any) => {};
    }

    let fnBody = `// Auto-generated by PayloadMapper.validate\n`;

    for (const field of fields) {
      this.assertSafePropertyName(field.propertyName);
      const prop = field.propertyName;
      const val = `instance['${prop}']`;

      if (field.type === 'pin_code') {
        fnBody += `
           if (typeof ${val} !== 'string' || ${val}.length !== 6) {
              throw new BoksProtocolError(
                BoksProtocolErrorId.INVALID_PIN_FORMAT,
                'PIN must be exactly 6 characters',
                { field: '${prop}', received: typeof ${val} === 'string' ? ${val}.length : typeof ${val}, expected: 6 }
              );
           }
           for (let i = 0; i < 6; i++) {
              const c = ${val}.charCodeAt(i);
              if ((c < 48 || c > 57) && c !== 65 && c !== 66 && c !== 97 && c !== 98) {
                 throw new BoksProtocolError(
                   BoksProtocolErrorId.INVALID_PIN_FORMAT,
                   'PIN must contain only 0-9, A, B',
                   { field: '${prop}', received: ${val}, expected: BoksExpectedReason.PIN_CODE_FORMAT }
                 );
              }
           }
         `;
      } else if (field.type === 'config_key') {
        fnBody += `
           if (typeof ${val} !== 'string' || ${val}.length !== 8) {
              throw new BoksProtocolError(
                BoksProtocolErrorId.INVALID_CONFIG_KEY,
                'Config Key must be exactly 8 characters',
                { field: '${prop}', received: typeof ${val} === 'string' ? ${val}.length : typeof ${val}, expected: 8 }
              );
           }
           for (let i = 0; i < 8; i++) {
              const c = ${val}.charCodeAt(i);
              if ((c < 48 || c > 57) && (c < 65 || c > 70) && (c < 97 || c > 102)) {
                 throw new BoksProtocolError(
                   BoksProtocolErrorId.INVALID_CONFIG_KEY,
                   'Config Key must contain only hex characters',
                   { field: '${prop}', received: ${val}, expected: BoksExpectedReason.VALID_HEX_CHAR }
                 );
              }
           }
         `;
      }
      // Other types (uint8, etc.) could have type/bounds checks here if needed
    }

    return new Function(
      'instance',
      'BoksProtocolError',
      'BoksProtocolErrorId',
      'BoksExpectedReason',
      fnBody
    ) as (...args: any[]) => any;
  }

  private static compileSerializer(targetClass: PayloadConstructor): (...args: any[]) => any {
    const fields = this.getFields(targetClass);

    if (!fields || fields.length === 0) {
      return () => EMPTY_BUFFER; // No fields mapped
    }

    // Calculate maximum required payload size securely
    let size = 0;
    for (const field of fields) {
      this.assertSafePropertyName(field.propertyName);

      let fieldSize = 1;
      if (field.type === 'uint16') {
        fieldSize = 2;
      } else if (field.type === 'uint24') {
        fieldSize = 3;
      } else if (field.type === 'uint32') {
        fieldSize = 4;
      } else if (field.type === 'mac_address') {
        fieldSize = 6;
      } else if (field.type === 'pin_code') {
        fieldSize = 6;
      } else if (field.type === 'config_key') {
        fieldSize = 8;
      } else if (field.type === 'ascii_string') {
        fieldSize = field.length!;
      } else if (field.type === 'hex_string' || field.type === 'byte_array') {
        fieldSize = typeof field.length === 'number' ? field.length : 0;
      } else if (field.type === 'var_len_hex') {
        fieldSize = 1; // Will grow dynamically based on instance value in dynamic size calc below
      } else if (field.type === 'bit') {
        fieldSize = 1;
      }

      this.assertSafeBounds(field.offset, fieldSize);

      const endOffset = field.offset + fieldSize;
      if (endOffset > size) {
        size = endOffset;
      }
    }

    let fnBody = `
// Fast inline hex digit parser.
// Character codes correspond to:
// 48-57: '0'-'9'
// 65-70: 'A'-'F'
// 97-102: 'a'-'f'
const hexVal = (c) => c >= 48 && c <= 57 ? c - 48 : c >= 65 && c <= 70 ? c - 55 : c >= 97 && c <= 102 ? c - 87 : -1;
const parseHex = (str, start) => {
  if (start >= str.length) return 0;
  const h = hexVal(str.charCodeAt(start));
  if (h === -1) return 0;
  const l = start + 1 < str.length ? hexVal(str.charCodeAt(start + 1)) : -1;
  return l === -1 ? h : (h << 4) | l;
};\n
      // Auto-generated by PayloadMapper
      if (!instance || typeof instance !== 'object') {
          throw new BoksProtocolError(BoksProtocolErrorId.INTERNAL_ERROR, 'Cannot serialize null or non-object instance');
      }
    `;

    // Calculate dynamic payload size based on actual values
    let dynamicSizeCalc = `${size}`;

    // Check if we need to add length for dynamic fields
    for (const field of fields) {
      const prop = field.propertyName;

      if (field.type === 'var_len_hex') {
        dynamicSizeCalc += ` + (instance['${prop}'] && typeof instance['${prop}'] === 'string' ? Math.floor(instance['${prop}'].length / 2) : 0)`;
      } else if (
        (field.type === 'hex_string' || field.type === 'byte_array') &&
        typeof field.length !== 'number'
      ) {
        if (field.type === 'hex_string') {
          dynamicSizeCalc += ` + (instance['${prop}'] && typeof instance['${prop}'] === 'string' ? Math.floor(instance['${prop}'].length / 2) : 0)`;
        } else {
          dynamicSizeCalc += ` + (instance['${prop}'] && instance['${prop}'] instanceof Uint8Array ? instance['${prop}'].length : 0)`;
        }
      }
    }

    fnBody += `
      const payload = new Uint8Array(${dynamicSizeCalc});
    `;

    for (const field of fields) {
      const o = field.offset;
      const prop = field.propertyName;

      if (field.type === 'bit') {
        if (typeof field.bitIndex !== 'number' || field.bitIndex < 0 || field.bitIndex > 7) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INTERNAL_ERROR,
            `Invalid bitIndex: ${field.bitIndex} for property ${prop}`,
            { field: prop, received: field.bitIndex, expected: BoksExpectedReason.BIT_INDEX }
          );
        }
      }

      // We read the instance value. Missing values default to 0 for numbers, or empty string.

      // Throw if mandatory fields are missing
      const isMandatory =
        field.type === 'pin_code' ||
        field.type === 'config_key' ||
        (field.type === 'uint8' && prop === 'index');
      if (isMandatory) {
        fnBody += `
          if (instance['${prop}'] === undefined || instance['${prop}'] === null) {
            throw new BoksProtocolError(
              BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
              'Missing mandatory field: ${prop}',
              { field: '${prop}', received: instance['${prop}'], expected: BoksExpectedReason.EXACT_LENGTH }
            );
          }
        `;
      }

      const val = `(instance['${prop}'] || 0)`;
      const strVal = `(String(instance['${prop}'] || ''))`;
      const strValRaw = `(String(instance['${prop}']))`;

      switch (field.type) {
        case 'uint8':
          fnBody += `payload[${o}] = ${val};\n`;
          break;
        case 'uint16':
          fnBody += `payload[${o}] = (${val} >> 8) & 0xFF;\n`;
          fnBody += `payload[${o + 1}] = ${val} & 0xFF;\n`;
          break;
        case 'uint24':
          fnBody += `payload[${o}] = (${val} >> 16) & 0xFF;\n`;
          fnBody += `payload[${o + 1}] = (${val} >> 8) & 0xFF;\n`;
          fnBody += `payload[${o + 2}] = ${val} & 0xFF;\n`;
          break;
        case 'uint32':
          fnBody += `payload[${o}] = (${val} >>> 24) & 0xFF;\n`;
          fnBody += `payload[${o + 1}] = (${val} >>> 16) & 0xFF;\n`;
          fnBody += `payload[${o + 2}] = (${val} >>> 8) & 0xFF;\n`;
          fnBody += `payload[${o + 3}] = ${val} & 0xFF;\n`;
          break;
        case 'ascii_string':
          // Unrolled charCodeAt, pads with 0x00 if string is shorter than fixed length
          for (let i = 0; i < field.length!; i++) {
            fnBody += `payload[${o + i}] = ${strVal}.length > ${i} ? ${strVal}.charCodeAt(${i}) : 0;\n`;
          }
          break;
        case 'boolean':
          fnBody += `payload[${o}] = instance['${prop}'] ? 0x01 : 0x00;\n`;
          break;
        case 'byte_array':
          if (typeof field.length === 'number') {
            fnBody += `
              if (instance['${prop}'] && instance['${prop}'] instanceof Uint8Array) {
                 payload.set(instance['${prop}'].subarray(0, ${field.length}), ${o});
              }
            `;
          } else {
            fnBody += `
              if (instance['${prop}'] && instance['${prop}'] instanceof Uint8Array) {
                 payload.set(instance['${prop}'], ${o});
              }
            `;
          }
          break;
        case 'mac_address':
          fnBody += `
            if (typeof instance['${prop}'] === 'string') {
              const parts = instance['${prop}'].split(':');
              if (parts.length === 6) {
                payload[${o} + 5] = parseHex(parts[0], 0);
                payload[${o} + 4] = parseHex(parts[1], 0);
                payload[${o} + 3] = parseHex(parts[2], 0);
                payload[${o} + 2] = parseHex(parts[3], 0);
                payload[${o} + 1] = parseHex(parts[4], 0);
                payload[${o}] = parseHex(parts[5], 0);
              }
            }
          `;
          break;
        case 'pin_code':
          for (let i = 0; i < 6; i++) {
            fnBody += `payload[${o + i}] = ${strValRaw}.charCodeAt(${i});\n`;
          }
          break;
        case 'config_key':
          for (let i = 0; i < 8; i++) {
            fnBody += `payload[${o + i}] = ${strValRaw}.charCodeAt(${i});\n`;
          }
          break;
        case 'hex_string':
          if (typeof field.length === 'number') {
            fnBody += `
              if (typeof instance['${prop}'] === 'string') {
                const s = instance['${prop}'];
                for (let i = 0; i < ${field.length}; i++) {
                  if (i * 2 < s.length) {
                    payload[${o} + i] = parseHex(s, i * 2);
                  }
                }
              }
            `;
          } else {
            fnBody += `
              if (typeof instance['${prop}'] === 'string') {
                const s = instance['${prop}'];
                for (let i = 0; i < Math.floor(s.length / 2); i++) {
                  payload[${o} + i] = parseHex(s, i * 2);
                }
              }
            `;
          }
          break;
        case 'var_len_hex':
          fnBody += `
            if (typeof instance['${prop}'] === 'string') {
              const s = instance['${prop}'];
              const len = Math.floor(s.length / 2);
              payload[${o}] = len;
              for (let i = 0; i < len; i++) {
                payload[${o} + 1 + i] = parseHex(s, i * 2);
              }
            } else {
              payload[${o}] = 0;
            }
          `;
          break;
        case 'bit':
          fnBody += `
            if (instance['${prop}']) {
              payload[${o}] |= (1 << ${field.bitIndex!});
            } else {
              payload[${o}] &= ~(1 << ${field.bitIndex!});
            }
          `;
          break;
      }
    }

    fnBody += `return payload;\n`;
    return new Function(
      'instance',
      'BoksProtocolError',
      'BoksProtocolErrorId',
      'BoksExpectedReason',
      fnBody
    ) as (...args: any[]) => any;
  }

  /**
   * Parses a payload directly into an object mapping using the JIT compiled function.
   *
   * @param targetClass The class constructor (e.g., OpenDoorPacket)
   * @param payload The raw buffer
   * @returns A mapped object containing the extracted properties
   */
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-function-type */
  public static parse<T = any>(targetClass: Function | any, payload: Uint8Array): T {
    if (typeof payload === 'string') {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_TYPE,
        'Payload must be a Uint8Array',
        { received: 'string', expected: 'Uint8Array' }
      );
    }
    if (!targetClass || typeof targetClass !== 'function') {
      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_TYPE, 'Invalid targetClass', {
        received: typeof targetClass,
        expected: 'function'
      });
    }
    if (!(payload instanceof Uint8Array)) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_TYPE,
        'Payload must be a Uint8Array',
        { received: typeof payload, expected: 'Uint8Array' }
      );
    }
    let parser = this.compiledParsers.get(targetClass as PayloadConstructor);
    if (!parser) {
      parser = this.compileParser(targetClass as PayloadConstructor);
      this.compiledParsers.set(targetClass as PayloadConstructor, parser);
    }
    const result = parser(
      payload,
      BoksProtocolError,
      BoksProtocolErrorId,
      BoksExpectedReason,
      this.HEX_TABLE,
      this.HEX_TABLE_16
    );
    return result as unknown as T;
  }

  /**
   * Serializes an instance into a Uint8Array payload using the JIT compiled function.
   */
  public static serialize(instance: any): Uint8Array {
    if (!instance || typeof instance !== 'object') {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_TYPE,
        'Cannot serialize null or non-object instance',
        { received: typeof instance, expected: 'object' }
      );
    }
    const targetClass = instance.constructor;
    if (!targetClass) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INTERNAL_ERROR,
        'Cannot serialize instance without constructor',
        { received: 'undefined', expected: 'constructor' }
      );
    }
    let serializer = this.compiledSerializers.get(targetClass as PayloadConstructor);
    if (!serializer) {
      serializer = this.compileSerializer(targetClass as PayloadConstructor);
      this.compiledSerializers.set(targetClass as PayloadConstructor, serializer);
    }
    return serializer(instance, BoksProtocolError, BoksProtocolErrorId, BoksExpectedReason);
  }

  /**
   * Defines a raw payload schema without decorators (useful for internal/dynamic mapping or tests).
   */

  /**
   * Validates an instance's properties based on its decorator schema.
   */
  public static validate(instance: any): void {
    const targetClass = instance.constructor;
    let validator = this.compiledValidators.get(targetClass as PayloadConstructor);

    if (!validator) {
      validator = this.compileValidator(targetClass as PayloadConstructor);
      this.compiledValidators.set(targetClass as PayloadConstructor, validator);
    }
    validator(instance, BoksProtocolError, BoksProtocolErrorId, BoksExpectedReason);
  }

  public static defineSchema(targetClass: any, schema: FieldDefinition[]): void {
    if (targetClass[Symbol.metadata]) {
      targetClass[Symbol.metadata][METADATA_KEY] = schema;
    } else {
      targetClass[METADATA_KEY] = schema;
      legacyMetadataMap.set(targetClass as PayloadConstructor, schema);
    }

    // Clear any existing compiled functions for this class
    this.compiledParsers.delete(targetClass as PayloadConstructor);
    this.compiledSerializers.delete(targetClass as PayloadConstructor);
    this.compiledValidators.delete(targetClass as PayloadConstructor);
  }
}

// --- Decorators ---
