import re

with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

# I had injected `require('fs').writeFileSync` during debug of JIT payload mapper.
# I'll restore it.
content = content.replace("require('fs').writeFileSync('parser.js', fnBody); return new Function(\n      'payload',", "return new Function(\n      'payload',")
content = content.replace("require('fs').writeFileSync('serializer.js', fnBody); return new Function(\n      'instance',", "return new Function(\n      'instance',")
content = content.replace("require('fs').writeFileSync('validator.js', fnBody); return new Function(\n      'instance',", "return new Function(\n      'instance',")

with open('src/protocol/decorators/PayloadMapper.ts', 'w') as f:
    f.write(content)
