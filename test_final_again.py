import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

# Add back import { BoksExpectedReason }
if "import { BoksExpectedReason }" not in content:
    content = content.replace("import { BoksProtocolError, BoksProtocolErrorId } from '../errors/BoksProtocolError';", "import { BoksProtocolError, BoksProtocolErrorId } from '../errors/BoksProtocolError';\nimport { BoksExpectedReason } from '../errors/BoksExpectedReason';")

with open('src/utils/converters.ts', 'w') as f:
    f.write(content)
