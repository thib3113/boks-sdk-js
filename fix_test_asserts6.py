import re
with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()
content = content + "\n" + "});"
with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
