# Ah, the SyntaxError "Unexpected character '@'" is standard TS syntax error from Acorn because Acorn can't parse TS decorators natively.
# This means the error is NOT in the test file logic itself, it's that Vite/Vitest is failing to transpile it correctly, OR some imported file is failing to transpile.
# Why is PayloadMapper.ts failing to transpile or load?
# Let's run `npm run test` without any specific file to see if the issue is global or isolated to PayloadMapper.ts.
