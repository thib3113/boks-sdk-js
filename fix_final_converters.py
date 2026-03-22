import re

# `hexToBytes` and `bytesToMac` missing issues.
# 1. Update converters test properly.
with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

content = content.replace("bytesToMac(", "bytesToHex(")
content = content.replace("bytesToHex as bytesToMac,", "")
content = content.replace("bytesToHex as bytesToHex,", "")

with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)

# 2. Fix fuzz tests for converters!
fuzz_files = [
    'tests/utils/resilience/converters.fuzz.test.ts',
    'tests/core/resilience/utils/Converters.fuzz.test.ts'
]

for file in fuzz_files:
    with open(file, 'r') as f:
        content = f.read()

    content = content.replace("bytesToMac(", "bytesToHex(")
    content = content.replace("import { bytesToMac }", "import { bytesToHex }")
    content = content.replace("import { bytesToHex, bytesToHex }", "import { bytesToHex }")
    content = re.sub(r'bytesToMac,?\n?', '', content)

    with open(file, 'w') as f:
        f.write(content)

# 3. PayloadMapper Syntax Error Fix
# The error was caused by `mac_address` fix missing something maybe.
with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

# Make sure we don't have multiple bytesToHex declarations or calls that are wrong in mac_address:
print("Checking PayloadMapper.ts mac_address")
print(content.find("result['${prop}'] = bytesToHex(payload.subarray(${o}, ${o} + 6), true);"))
