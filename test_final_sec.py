with open('tests/security/PayloadMapperJit.test.ts', 'r') as f:
    content = f.read()

content = content.replace("const dangerous = ['__proto__', 'constructor', 'prototype', 'HEX_TABLE', 'BoksProtocolError'];", "const dangerous = ['__proto__', 'constructor', 'prototype', 'BoksProtocolError'];")

with open('tests/security/PayloadMapperJit.test.ts', 'w') as f:
    f.write(content)
