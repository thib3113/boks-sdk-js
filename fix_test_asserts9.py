import re

with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

# Oh, the import string has `../src/utils/converters` but it is `@/utils/converters` or `../../src/utils/converters`
content = content.replace("import { bytesToHex } from '../../src/utils/converters';", "import { bytesToHex, writeConfigKeyToBuffer } from '../../src/utils/converters';")
content = content.replace("import { hexToBytes, bytesToHex } from '../../src/utils/converters';", "import { hexToBytes, bytesToHex, writeConfigKeyToBuffer } from '../../src/utils/converters';")

# Wait, let's just do a generic replace
content = re.sub(r"import\s+\{([^}]+)\}\s+from\s+'../../src/utils/converters';", r"import {\1, writeConfigKeyToBuffer } from '../../src/utils/converters';", content)

with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
