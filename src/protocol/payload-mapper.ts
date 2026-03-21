import { bytesToHex } from '../utils/converters';
/* eslint-disable @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any */
import { BoksProtocolError, BoksProtocolErrorId } from '../errors/BoksProtocolError';
import { BoksExpectedReason } from '../errors/BoksExpectedReason';
import { validateMasterCodeIndex, validateNfcUid, validateSeed } from '../utils/validation';

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

const legacyMetadataMap = new WeakMap<Function, FieldDefinition[]>();

function getOrCreateMetadata(context: ClassAccessorDecoratorContext<any, any>): FieldDefinition[] {
  if (context.metadata) {
    if (!context.metadata[METADATA_KEY]) {
      context.metadata[METADATA_KEY] = [];
    } else if (!Object.prototype.hasOwnProperty.call(context.metadata, METADATA_KEY)) {
      // It's inherited from a parent! We must clone it so we don't mutate the parent's schema!
      context.metadata[METADATA_KEY] = [...(context.metadata[METADATA_KEY] as FieldDefinition[])];
    }
    return context.metadata[METADATA_KEY] as FieldDefinition[];
  }
  return /* v8 ignore next */ [];
}

/**
 * Core Payload Mapper utility.
 * Compiles and executes JIT (Just-In-Time) parsing functions for extreme performance.
 */
export class PayloadMapper {
  // Cache of compiled parsing functions, keyed by Class Constructor
  private static compiledParsers = new WeakMap<Function, Function>();
  // Cache of compiled serialization functions
  private static compiledSerializers = new WeakMap<Function, Function>();
  private static compiledValidators = new WeakMap<Function, Function>();

  /**
   * Pre-computed hex table for JIT compilers
   */
  private static readonly HEX_TABLE = Array.from({ length: 256 }, (_, i) =>
    i.toString(16).padStart(2, '0').toUpperCase()
  );

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

  private static getFields(targetClass: any): FieldDefinition[] {
    const allFields: FieldDefinition[] = [];
    const seen = new Set<string>();
    let currentClass = targetClass;
    while (
      currentClass &&
      currentClass !== Function.prototype &&
      currentClass !== Object.prototype
    ) {
      let symMetadata: symbol | undefined = Symbol.metadata;
      /* v8 ignore next 4 */
      if (!symMetadata) {
        const symbols = Object.getOwnPropertySymbols(currentClass);
        symMetadata = symbols.find((s) => s.toString() === 'Symbol(Symbol.metadata)');
      }
      const fields =
        /* v8 ignore next */ (symMetadata && currentClass[symMetadata as any]?.[METADATA_KEY]) ||
        /* v8 ignore next */ currentClass[Symbol.metadata as any]?.[METADATA_KEY] ||
        /* v8 ignore next */ currentClass.constructor?.[Symbol.metadata as any]?.[METADATA_KEY] ||
        legacyMetadataMap.get(currentClass) ||
        /* v8 ignore next */ currentClass[METADATA_KEY] ||
        /* v8 ignore next */ currentClass.constructor?.[METADATA_KEY];

      if (fields && Array.isArray(fields)) {
        // Add fields that aren't already mapped
        for (const f of fields) {
          if (!seen.has(f.propertyName)) {
            allFields.push(f);
            seen.add(f.propertyName);
          }
        }
      }
      currentClass = Object.getPrototypeOf(currentClass);
    }

    return allFields;
  }

  private static compileParser(targetClass: any): Function {
    const fields = this.getFields(targetClass);

    if (!fields || fields.length === 0) {
      /* v8 ignore next */
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
        /* v8 ignore next */
      } else if (field.type === 'config_key') {
        size = 8;
      } else if (field.type === 'ascii_string') {
        /* v8 ignore next 5 */
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
            /* v8 ignore next 3 */
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
               /* v8 ignore next */
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
            for (let i = 0; i < field.length; i++) {
              hexArgs.push(`HEX_TABLE[payload[${o + i}]]`);
            }
            if (hexArgs.length > 0) {
              fnBody += `result['${prop}'] = ${hexArgs.join(' + ')};\n`;
            } else {
              /* v8 ignore next 3 */
              fnBody += `result['${prop}'] = '';\n`;
            }
          } else {
            /* v8 ignore next 11 */
            fnBody += `
            {
               let s = '';
               for (let i = ${o}; i < payload.length; i++) {
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
             for (let i = 0; i < len; i++) {
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
      fnBody
    );
  }

  /**
   * Compiles the JIT serialization function for a class.
   */

  /**
   * Compiles the JIT validation function for a class instance.
   * Used in constructors to validate manually provided properties.
   */
  private static compileValidator(targetClass: any): Function {
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
        /* v8 ignore next */
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
    );
  }

  private static compileSerializer(targetClass: any): Function {
    const fields = this.getFields(targetClass);

    /* v8 ignore next */
    if (!fields || fields.length === 0) {
      return (_instance: any) => new Uint8Array(0); // No fields mapped
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
        /* v8 ignore next */
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
      /* v8 ignore next 2 */
      if (field.type === 'var_len_hex') {
        /* v8 ignore next */
        dynamicSizeCalc += ` + (instance['${prop}'] && typeof instance['${prop}'] === 'string' ? Math.floor(instance['${prop}'].length / 2) : 0)`;
      } else if (
        (field.type === 'hex_string' || field.type === 'byte_array') &&
        /* v8 ignore next */ typeof field.length !== 'number'
      ) {
        /* v8 ignore next 5 */
        if (field.type === 'hex_string') {
          /* v8 ignore next */
          dynamicSizeCalc += ` + (instance['${prop}'] && typeof instance['${prop}'] === 'string' ? Math.floor(instance['${prop}'].length / 2) : 0)`;
        } else {
          /* v8 ignore next */
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
          // Reverse Mac formatting not yet supported for serialization in POC,
          // but we leave it empty to not break JIT. Downlinks rarely serialize MACs.
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
                    payload[${o} + i] = parseInt(s.substring(i * 2, i * 2 + 2), 16) || 0;
                  }
                }
              }
            `;
          } else {
            fnBody += `
              if (typeof instance['${prop}'] === 'string') {
                const s = instance['${prop}'];
                for (let i = 0; i < Math.floor(s.length / 2); i++) {
                  payload[${o} + i] = parseInt(s.substring(i * 2, i * 2 + 2), 16) || 0;
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
                payload[${o} + 1 + i] = parseInt(s.substring(i * 2, i * 2 + 2), 16) || 0;
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
    );
  }

  /**
   * Parses a payload directly into an object mapping using the JIT compiled function.
   *
   * @param targetClass The class constructor (e.g., OpenDoorPacket)
   * @param payload The raw buffer
   * @returns A mapped object containing the extracted properties
   */
  public static parse<T = any>(targetClass: Function, payload: Uint8Array): T {
    if (!(payload instanceof Uint8Array)) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_TYPE,
        'Payload must be a Uint8Array',
        { received: typeof payload, expected: 'Uint8Array' }
      );
    }
    let parser = this.compiledParsers.get(targetClass);
    if (!parser) {
      parser = this.compileParser(targetClass);
      this.compiledParsers.set(targetClass, parser);
    }
    const result = parser(
      payload,
      BoksProtocolError,
      BoksProtocolErrorId,
      BoksExpectedReason,
      this.HEX_TABLE
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
    let serializer = this.compiledSerializers.get(targetClass);
    if (!serializer) {
      serializer = this.compileSerializer(targetClass);
      this.compiledSerializers.set(targetClass, serializer);
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
    let validator = this.compiledValidators.get(targetClass);
    /* v8 ignore next */
    if (!validator) {
      validator = this.compileValidator(targetClass);
      this.compiledValidators.set(targetClass, validator);
    }
    validator(instance, BoksProtocolError, BoksProtocolErrorId, BoksExpectedReason);
  }

  public static defineSchema(targetClass: any, schema: FieldDefinition[]): void {
    /* v8 ignore next 5 */
    if (targetClass[Symbol.metadata]) {
      targetClass[Symbol.metadata][METADATA_KEY] = schema;
    } else {
      targetClass[METADATA_KEY] = schema;
      legacyMetadataMap.set(targetClass, schema);
    }

    // Clear any existing compiled functions for this class
    this.compiledParsers.delete(targetClass);
    this.compiledSerializers.delete(targetClass);
    this.compiledValidators.delete(targetClass);
  }
}

// --- Decorators ---

export function PayloadUint8(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'uint8', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadUint16(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 2);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'uint16', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadUint24(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 3);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'uint24', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadUint32(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 4);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'uint32', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadAsciiString(offset: number, length: number) {
  PayloadMapper.assertSafeBounds(offset, length);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'ascii_string', offset, length });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadMacAddress(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 6);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'mac_address', offset, length: 6 });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadSeed(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 32);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'hex_string', offset, length: 32 });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }

        let formattedStr: string;
        validateSeed(val as unknown as string | Uint8Array);
        if (typeof val === 'string') {
          formattedStr = val.toUpperCase();
        } else {
          // It's a Uint8Array
          formattedStr = bytesToHex(val as unknown as Uint8Array).toUpperCase();
        }

        target.set.call(this, formattedStr as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadHexString(offset: number, length?: number) {
  PayloadMapper.assertSafeBounds(offset, length || 0);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'hex_string', offset, length });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadVarLenHex(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'var_len_hex', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadBit(offset: number, bitIndex: number) {
  PayloadMapper.assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    if (bitIndex < 0 || bitIndex > 7) {
      throw new Error(`Invalid bitIndex ${bitIndex} for property ${context.name as string}`);
    }
    meta.push({ propertyName: context.name as string, type: 'bit', offset, bitIndex });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadPinCode(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 6);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'pin_code', offset, length: 6 });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        const formatted = typeof val === 'string' ? val.toUpperCase() : String(val).toUpperCase();
        if (formatted.length !== 6) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_PIN_FORMAT,
            'PIN must be exactly 6 characters',
            { field: context.name as string, received: formatted.length, expected: 6 }
          );
        }
        for (let i = 0; i < 6; i++) {
          const c = formatted.charCodeAt(i);
          if ((c < 48 || c > 57) && c !== 65 && c !== 66 && c !== 97 && c !== 98) {
            throw new BoksProtocolError(
              BoksProtocolErrorId.INVALID_PIN_FORMAT,
              'PIN must contain only 0-9, A, B',
              {
                field: context.name as string,
                received: formatted,
                expected: BoksExpectedReason.PIN_CODE_FORMAT
              }
            );
          }
        }
        target.set.call(this, formatted as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadNfcUid(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    // Uses var_len_hex because NFC UID is variable length hex in the payload
    meta.push({ propertyName: context.name as string, type: 'var_len_hex', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        const strVal = String(val);
        validateNfcUid(strVal);
        const formatted = strVal.replace(/:/g, '').toUpperCase();
        target.set.call(this, formatted as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadConfigKey(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 8);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'config_key', offset, length: 8 });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        const formatted = typeof val === 'string' ? val.toUpperCase() : String(val).toUpperCase();
        if (formatted.length !== 8) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_CONFIG_KEY,
            'Config Key must be exactly 8 characters',
            { field: context.name as string, received: formatted.length, expected: 8 }
          );
        }
        for (let i = 0; i < 8; i++) {
          const c = formatted.charCodeAt(i);
          if ((c < 48 || c > 57) && (c < 65 || c > 70) && (c < 97 || c > 102)) {
            throw new BoksProtocolError(
              BoksProtocolErrorId.INVALID_CONFIG_KEY,
              'Config Key must contain only hex characters',
              {
                field: context.name as string,
                received: formatted,
                expected: BoksExpectedReason.VALID_HEX_CHAR
              }
            );
          }
        }
        target.set.call(this, formatted as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadMasterCodeIndex(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'uint8', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          /* v8 ignore next */ /* v8 ignore next */
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        validateMasterCodeIndex(val as number);
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadBoolean(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'boolean', offset });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          /* v8 ignore next */ /* v8 ignore next */
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}

export function PayloadByteArray(offset: number, length?: number) {
  PayloadMapper.assertSafeBounds(offset, length || 0);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'byte_array', offset, length });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          /* v8 ignore next */ /* v8 ignore next */
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }

        if (length !== undefined && (val as unknown as Uint8Array).length !== length) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
            `Array length must be exactly ${length}`,
            {
              field: context.name as string,
              received: (val as unknown as Uint8Array).length,
              expected: length
            }
          );
        }
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
