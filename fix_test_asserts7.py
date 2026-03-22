import re

with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

# I forgot to import `writeConfigKeyToBuffer` in tests/utils/converters.test.ts!
content = content.replace("import { bytesToHex }", "import { bytesToHex, writeConfigKeyToBuffer }")
content = content.replace("import { hexToBytes, bytesToHex }", "import { hexToBytes, bytesToHex, writeConfigKeyToBuffer }")

with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
