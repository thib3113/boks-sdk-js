# The error `SyntaxError: Invalid or unexpected token` means Babel failed to parse decorators or something, and Vite fed it garbage or V8 threw.
# Is it the `accessor` keyword?
# TS 5 has decorators, but `vitest` config has `@babel/plugin-proposal-decorators` which was maybe working.
# Let's run the test directly on PRISTINE source tree (which I already checked out!)
