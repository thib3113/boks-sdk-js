import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

content = content.replace("import { BoksExpectedReason } from '../errors/BoksExpectedReason';", "")

with open('src/utils/converters.ts', 'w') as f:
    f.write(content)
