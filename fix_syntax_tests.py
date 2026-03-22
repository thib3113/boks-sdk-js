# If babel parses it fine, the syntax error `Invalid or unexpected token` must be in the JIT evaluated code that throws at RUNTIME during the test!
# When Vitest says "SyntaxError: Invalid or unexpected token" right at the test suite start, it usually means there is a top-level runtime error during import.
# BUT wait! A SyntaxError thrown during module load?
# Or maybe the test file `tests/protocol/PayloadMapper.exhaustive.test.ts` has a bad token introduced by one of my scripts earlier?
# Wait! I ran `git checkout HEAD tests/protocol/PayloadMapper.exhaustive.test.ts` so the test file is exactly like origin/main.
# Let's check if the module `src/protocol/decorators/PayloadMapper.ts` is throwing at load time.
# What does PayloadMapper.ts load time execute?
# Nothing special.
# BUT the `fnBody` generation inside JIT:
# In `compileParser`:
# I used `bytesToHex(payload.subarray(${o}, ${o} + 6), true);`
# What if `bytesToHex` is not defined?
# Wait, I did not change the execution logic at load time.
# Oh! Did I introduce a weird unprintable character when rewriting?

import re

with open('src/protocol/decorators/PayloadMapper.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's clean up any \r
content = content.replace('\r', '')

# Remove invisible characters
content = re.sub(r'[\u200B-\u200D\uFEFF]', '', content)

with open('src/protocol/decorators/PayloadMapper.ts', 'w', encoding='utf-8') as f:
    f.write(content)
