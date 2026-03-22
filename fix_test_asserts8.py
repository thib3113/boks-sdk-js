import re

with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

# I see it, the `import { writeConfigKeyToBuffer }` was not added because the target didn't match perfectly.
# Let's just find the import block and add it.

content = re.sub(r"import \{([^}]+)\} from '../src/utils/converters';", r"import {\1, writeConfigKeyToBuffer } from '../src/utils/converters';", content)

with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
