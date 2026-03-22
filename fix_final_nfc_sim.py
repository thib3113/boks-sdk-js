import re

# Fix src/protocol/decorators/PayloadNfcUid.ts
with open('src/protocol/decorators/PayloadNfcUid.ts', 'r') as f:
    content = f.read()

content = content.replace("import { cleanHexString } from '../../utils/converters';", "import { hexToBytes, bytesToHex } from '../../utils/converters';")
content = content.replace("const formatted = cleanHexString(strVal);", "const formatted = bytesToHex(hexToBytes(strVal));")

with open('src/protocol/decorators/PayloadNfcUid.ts', 'w') as f:
    f.write(content)

# Fix src/simulator/BoksSimulator.ts
with open('src/simulator/BoksSimulator.ts', 'r') as f:
    content = f.read()

content = content.replace("bytesToMac", "bytesToHex")
content = content.replace("import { bytesToHex,", "import {")

with open('src/simulator/BoksSimulator.ts', 'w') as f:
    f.write(content)

# Fix tests/utils/converters.test.ts
with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

content = content.replace("bytesToMac,", "")
with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
