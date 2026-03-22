# The syntax error MUST be in the loaded `PayloadMapper.ts`. Vitest caches transpiled outputs or there's an invisible char.
# Wait, `import { PayloadMapper, ... } from '@/protocol/decorators';`
# Let me look closely at `src/protocol/decorators/PayloadMapper.ts`.
import fs from 'fs';
import { parse } from '@babel/parser';

// I ran `@babel/parser` on `PayloadMapper.ts` and it passed.
// But what about standard node transpilation?
# I'll just check if replacing PayloadMapper.ts entirely from HEAD fixes it!
import subprocess
subprocess.run(['git', 'checkout', 'HEAD', '--', 'src/protocol/decorators/PayloadMapper.ts'])
