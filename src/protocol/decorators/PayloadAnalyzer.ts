import { FieldDefinition } from './PayloadMapper';

export class PayloadAnalyzer {
  public static generateParserForField(field: FieldDefinition): string {
    const o = field.offset;
    const prop = field.propertyName;
    let fnBody = '';

    if (field.type === 'bit') {
      if (typeof field.bitIndex !== 'number' || field.bitIndex < 0 || field.bitIndex > 7) {
        throw new Error(`Invalid bitIndex: ${field.bitIndex} for property ${prop}`);
      }
    }

    switch (field.type) {
      case 'uint8':
        fnBody += `result['${prop}'] = payload[${o}];\n`;
        break;
      case 'uint16':
        fnBody += `result['${prop}'] = (payload[${o}] << 8) | payload[${o + 1}];\n`;
        break;
      case 'uint24':
        fnBody += `result['${prop}'] = (payload[${o}] << 16) | (payload[${o + 1}] << 8) | payload[${o + 2}];\n`;
        break;
      case 'uint32':
        fnBody += `result['${prop}'] = ((payload[${o}] << 24) | (payload[${o + 1}] << 16) | (payload[${o + 2}] << 8) | payload[${o + 3}]) >>> 0;\n`;
        break;
      case 'ascii_string': {
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
          fnBody += `result['${prop}'] = payload.slice(${o}, ${o} + ${field.length});\n`;
        } else {
          fnBody += `result['${prop}'] = payload.slice(${o});\n`;
        }
        break;
      case 'mac_address':
        fnBody += `
          result['${prop}'] = bytesToHex(payload, { reverse: true, start: ${o}, end: ${o} + 6 });
        `;
        break;
      case 'pin_code':
        fnBody += `
        {
           const s = readPinFromBuffer(payload, ${o});
           const isId = ${field.allowIds} && (s.startsWith('MC') || s.startsWith('UC'));

           for(let i=0; i<6; i++) {
             const c = s.charCodeAt(i);
             const isStd = (c >= 48 && c <= 57) || c === 65 || c === 66; // 0-9, A, B
             if (isStd) continue;

             if (isId) {
               if (i === 0 && (c === 77 || c === 85)) continue; // M or U
               if (i === 1 && c === 67) continue; // C
             }

             throw new BoksProtocolError(
               BoksProtocolErrorId.INVALID_PIN_FORMAT,
               'Invalid PIN character inline',
               { field: '${prop}', received: s, expected: BoksExpectedReason.VALID_HEX_CHAR }
             );
           }
           result['${prop}'] = s;
         }
         `;
        break;
      case 'config_key':
        fnBody += `{
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
         }`;
        break;
      case 'hex_string': {
        if (typeof field.length === 'number') {
          fnBody += `result['${prop}'] = bytesToHex(payload, { start: ${o}, end: ${o} + ${field.length} });\n`;
        } else {
          fnBody += `
          result['${prop}'] = bytesToHex(payload, { start: ${o} });
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
           result['${prop}'] = bytesToHex(payload, { start: ${o + 1}, end: ${o + 1} + len });
        }
        `;
        break;
      }
      case 'bit': {
        fnBody += `result['${prop}'] = ((payload[${o}] >> ${field.bitIndex!}) & 1) === 1;\n`;
        break;
      }
    }
    return fnBody;
  }

  public static generateValidatorForField(field: FieldDefinition): string {
    const prop = field.propertyName;
    let fnBody = '';
    const val = `instance['${prop}']`;

    switch (field.type) {
      case 'pin_code':
        fnBody += `
           if (typeof ${val} !== 'string' || ${val}.length !== 6) {
              throw new BoksProtocolError(
                BoksProtocolErrorId.INVALID_PIN_FORMAT,
                'PIN code must be exactly 6 characters',
                { field: '${prop}', received: typeof ${val} === 'string' ? ${val}.length : typeof ${val}, expected: 6 }
              );
           }
           const isId_${prop} = ${field.allowIds} && (${val}.startsWith('MC') || ${val}.startsWith('UC'));
           for (let i = 0; i < 6; i++) {
              const c = ${val}.charCodeAt(i);
              const isStd = (c >= 48 && c <= 57) || c === 65 || c === 66; // 0-9, A, B
              if (isStd) continue;

              if (isId_${prop}) {
                if (i === 0 && (c === 77 || c === 85)) continue; // M or U
                if (i === 1 && c === 67) continue; // C
              }

              throw new BoksProtocolError(
                BoksProtocolErrorId.INVALID_PIN_FORMAT,
                'Invalid PIN character inline',
                { field: '${prop}', received: ${val}, expected: BoksExpectedReason.VALID_HEX_CHAR }
              );
           }
         `;
        break;
      case 'config_key':
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
        break;
    }
    return fnBody;
  }

  public static generateSerializerForField(field: FieldDefinition): string {
    const o = field.offset;
    const prop = field.propertyName;
    let fnBody = '';

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
               const src = instance['${prop}'];
               const len = Math.min(src.length, ${field.length});
               for (let i = 0; i < len; i++) {
                 payload[${o} + i] = src[i];
               }
            }
          `;
        } else {
          fnBody += `
            if (instance['${prop}'] && instance['${prop}'] instanceof Uint8Array) {
               const src = instance['${prop}'];
               for (let i = 0; i < src.length; i++) {
                 payload[${o} + i] = src[i];
               }
            }
          `;
        }
        break;
      case 'mac_address':
        fnBody += `
          if (typeof instance['${prop}'] === 'string') {
            const bytes = hexToBytes(instance['${prop}']);
            if (bytes.length === 6) {
              payload[${o}] = bytes[5];
              payload[${o + 1}] = bytes[4];
              payload[${o + 2}] = bytes[3];
              payload[${o + 3}] = bytes[2];
              payload[${o + 4}] = bytes[1];
              payload[${o + 5}] = bytes[0];
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
              const bytes = hexToBytes(instance['${prop}']);
              for (let i = 0; i < ${field.length} && i < bytes.length; i++) {
                payload[${o} + i] = bytes[i];
              }
            } else if (instance['${prop}'] instanceof Uint8Array) {
              const src = instance['${prop}'];
              const len = Math.min(src.length, ${field.length});
              for (let i = 0; i < len; i++) {
                payload[${o} + i] = src[i];
              }
            }
          `;
        } else {
          fnBody += `
            if (typeof instance['${prop}'] === 'string') {
              const bytes = hexToBytes(instance['${prop}']);
              payload.set(bytes, ${o});
            } else if (instance['${prop}'] instanceof Uint8Array) {
              payload.set(instance['${prop}'], ${o});
            }
          `;
        }
        break;
      case 'var_len_hex':
        fnBody += `
          if (typeof instance['${prop}'] === 'string') {
            const bytes = hexToBytes(instance['${prop}']);
            payload[${o}] = bytes.length;
            payload.set(bytes, ${o} + 1);
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

    return fnBody;
  }
}
