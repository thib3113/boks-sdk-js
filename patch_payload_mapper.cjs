const fs = require('fs');
const file = 'src/protocol/payload-mapper.ts';
let code = fs.readFileSync(file, 'utf8');

// For field types: uint8, uint16, uint24, uint32, ascii_string, boolean, byte_array, mac_address, pin_code, config_key, hex_string

// Instead of (instance['propertyName'] || 0), we want to throw if it's undefined/null for mandatory fields (like pin_code, config_key, index(uint8))
// We'll update compileSerializer.

// Let's modify the compileSerializer switch statement
const switchStart = "const val = `(instance['${prop}'] || 0)`;";
const switchEnd = "fnBody += `return payload;\\n`;";

const newSwitch = `
      // Throw if mandatory fields are missing
      const isMandatory = field.type === 'pin_code' || field.type === 'config_key' || (field.type === 'uint8' && prop === 'index');
      if (isMandatory) {
        fnBody += \`
          if (instance['\${prop}'] === undefined || instance['\${prop}'] === null) {
            throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, 'Missing mandatory field: \${prop}');
          }
        \`;
      }

      const val = \`(instance['\${prop}'] || 0)\`;
      const strVal = \`(String(instance['\${prop}'] || ''))\`;
      const strValRaw = \`(String(instance['\${prop}']))\`;

      switch (field.type) {
        case 'uint8':
          fnBody += \`payload[\${o}] = \${val};\\n\`;
          break;
        case 'uint16':
          fnBody += \`payload[\${o}] = (\${val} >> 8) & 0xFF;\\n\`;
          fnBody += \`payload[\${o + 1}] = \${val} & 0xFF;\\n\`;
          break;
        case 'uint24':
          fnBody += \`payload[\${o}] = (\${val} >> 16) & 0xFF;\\n\`;
          fnBody += \`payload[\${o + 1}] = (\${val} >> 8) & 0xFF;\\n\`;
          fnBody += \`payload[\${o + 2}] = \${val} & 0xFF;\\n\`;
          break;
        case 'uint32':
          fnBody += \`payload[\${o}] = (\${val} >>> 24) & 0xFF;\\n\`;
          fnBody += \`payload[\${o + 1}] = (\${val} >>> 16) & 0xFF;\\n\`;
          fnBody += \`payload[\${o + 2}] = (\${val} >>> 8) & 0xFF;\\n\`;
          fnBody += \`payload[\${o + 3}] = \${val} & 0xFF;\\n\`;
          break;
        case 'ascii_string':
          // Unrolled charCodeAt, pads with 0x00 if string is shorter than fixed length
          for (let i = 0; i < field.length!; i++) {
            fnBody += \`payload[\${o + i}] = \${strVal}.length > \${i} ? \${strVal}.charCodeAt(\${i}) : 0;\\n\`;
          }
          break;
        case 'boolean':
          fnBody += \`payload[\${o}] = instance['\${prop}'] ? 0x01 : 0x00;\\n\`;
          break;
        case 'byte_array':
          fnBody += \`
            if (instance['\${prop}'] && instance['\${prop}'] instanceof Uint8Array) {
               payload.set(instance['\${prop}'].subarray(0, \${field.length}), \${o});
            }
          \`;
          break;
        case 'mac_address':
          // Reverse Mac formatting not yet supported for serialization in POC,
          // but we leave it empty to not break JIT. Downlinks rarely serialize MACs.
          break;
        case 'pin_code':
          for (let i = 0; i < 6; i++) {
            fnBody += \`payload[\${o + i}] = \${strValRaw}.charCodeAt(\${i});\\n\`;
          }
          break;
        case 'config_key':
          for (let i = 0; i < 8; i++) {
            fnBody += \`payload[\${o + i}] = \${strValRaw}.charCodeAt(\${i});\\n\`;
          }
          break;
        case 'hex_string':
          // Convert hex string back to bytes. Not fully implemented in POC serializer yet.
          break;
      }
`;

// It's inside compileSerializer
code = code.replace(/const val = `\(instance\['\${prop}'\] \|\| 0\)`;[\s\S]*?case 'hex_string':\s*\/\/ Convert hex string back to bytes\. Not fully implemented in POC serializer yet\.\s*break;\s*}/, newSwitch);

fs.writeFileSync(file, code);
