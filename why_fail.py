# LOOK AT `config_key` case.
# There is an unbalanced brace in my replaced config_key validation string in `PayloadMapper.ts`!!!
# Let me look closely:
"""
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
"""
# YES! The `for(let i=0; i<8; i++) {` opens a brace.
# Then `if ((c < 48 || c > 57) && (c < 65 || c > 70) && (c < 97 || c > 102)) {` opens a brace.
# Then `}` closes the if.
# Then `}` closes the for.
# There are 2 `{` and 2 `}`. It IS balanced!

# But what about the ORIGINAL source?
with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

import subprocess
# Let's restore PayloadMapper.ts entirely to MAIN and apply ONLY `mac_address` fix using my exact script `fix_mapper_simple.py`.
subprocess.run(['git', 'checkout', 'HEAD', '--', 'src/protocol/decorators/PayloadMapper.ts'])
