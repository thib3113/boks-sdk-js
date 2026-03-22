with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

# I am resetting PayloadMapper to the pristine version
import subprocess
subprocess.run(['git', 'checkout', 'HEAD', '--', 'src/protocol/decorators/PayloadMapper.ts'])

with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

# OH MY GOD
# The syntax error in `PayloadMapper.ts` was caused by `npx eslint src/protocol/decorators/PayloadMapper.ts --fix`.
# Eslint ruined the file because my replacement was slightly off, breaking some block, and then eslint tried to fix it and mangled it entirely!
# Let's verify by just doing the replacement carefully and NOT running eslint --fix!

# 1. Remove HEX_TABLE declaration
content = content.replace(
    "  private static readonly HEX_TABLE = Array.from({ length: 256 }, (_, i) =>\n    i.toString(16).padStart(2, '0').toUpperCase()\n  );\n",
    ""
)

# 2. Update mac_address block in compileParser
old_mac = """        case 'mac_address':
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
          break;"""
new_mac = """        case 'mac_address':
          // Reverse Little Endian to Big Endian (Standard Format: XXXXXXXXXXXX)
          fnBody += `
            result['${prop}'] = bytesToHex(payload.subarray(${o}, ${o} + 6), true);
          `;
          break;"""

content = content.replace(old_mac, new_mac)

# 3. Remove 'HEX_TABLE' argument string from Function constructor in compileParser
content = content.replace("      'HEX_TABLE',\n", "")

# 4. Remove this.HEX_TABLE from parser execution args
content = content.replace("      this.HEX_TABLE,\n", "")

with open('src/protocol/decorators/PayloadMapper.ts', 'w') as f:
    f.write(content)
