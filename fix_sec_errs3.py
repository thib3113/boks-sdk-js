# The vitest error "SyntaxError: Invalid or unexpected token" must be because Vite cannot parse the decorator accessors in my modified PayloadMapper.ts because I removed some plugin config somewhere?
# Wait, I never touched Vite config or tsconfig.
# Why is PayloadMapper.ts failing but NOT other test files using decorators?
# Let's run all tests! Other tests DO use decorators and pass (AskDoorStatusPacket.test.ts etc.).
# What if the syntax error is an invisible character in tests/protocol/PayloadMapper.exhaustive.test.ts ?
import re

with open('tests/protocol/PayloadMapper.exhaustive.test.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r', '')
content = re.sub(r'[\u200B-\u200D\uFEFF]', '', content)

with open('tests/protocol/PayloadMapper.exhaustive.test.ts', 'w', encoding='utf-8') as f:
    f.write(content)
