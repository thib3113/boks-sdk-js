import re

with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

# I am resetting PayloadMapper to the pristine version
import subprocess
subprocess.run(['git', 'checkout', 'HEAD', '--', 'src/protocol/decorators/PayloadMapper.ts'])

with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

# 1. Remove HEX_TABLE
content = content.replace(
    "  private static readonly HEX_TABLE = Array.from({ length: 256 }, (_, i) =>\n    i.toString(16).padStart(2, '0').toUpperCase()\n  );\n",
    ""
)

# 2. Update mac_address
content = content.replace(
"""        case 'mac_address':
          // Reverse Little Endian to Big Endian (Standard Format: XXXXXXXXXXXX)
          fnBody += `
            result['${prop}'] =
              HEX_TABLE[payload[${o + 5}]] +
              HEX_TABLE[payload[${o + 4}]] +
              HEX_TABLE[payload[${o + 3}]] +
              HEX_TABLE[payload[${o + 2}]] +
              HEX_TABLE[payload[${o + 1}]] +
              HEX_TABLE[payload[${o}]];
          `;
          break;""",
"""        case 'mac_address':
          // Reverse Little Endian to Big Endian (Standard Format: XXXXXXXXXXXX)
          fnBody += `
            result['${prop}'] = bytesToHex(payload.subarray(${o}, ${o} + 6), true);
          `;
          break;"""
)

# 3. Remove 'HEX_TABLE' argument string in compileParser
content = content.replace("      'HEX_TABLE',\n", "")

# 4. Remove this.HEX_TABLE parameter injection in parse
content = content.replace("      this.HEX_TABLE,\n", "")

with open('src/protocol/decorators/PayloadMapper.ts', 'w') as f:
    f.write(content)
