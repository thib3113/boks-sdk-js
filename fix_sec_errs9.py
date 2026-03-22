# The only reason Vitest/Vite fails to parse decorators now when it didn't before is if I accidentally updated Vite or Vitest dependencies during `npm i` or broke something in `package.json`.
# When I ran `npm install @babel/parser`, it might have updated a peer dependency that breaks decorators in Vite (like @vitest/oxc or @babel/plugin-transform-typescript).
# Or maybe `package-lock.json` got mutated!
import subprocess
subprocess.run(['git', 'checkout', '--', 'package.json'])
subprocess.run(['git', 'checkout', '--', 'package-lock.json'])
subprocess.run(['npm', 'ci'])
