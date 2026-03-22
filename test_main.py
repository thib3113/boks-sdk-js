# Ok, if it fails on pristine HEAD, then maybe "SyntaxError: Invalid or unexpected token" isn't a *real* Javascript parsing error of the test file, but a RUNTIME failure inside the test.
# Does Vitest throw "SyntaxError" directly on failed imports?
# Yes, if you run `npm run test`, ANY test with this JIT PayloadMapper throws `SyntaxError: Invalid or unexpected token`.
# Wait, look closely: This happens when we run ANY test.
# Is `tests/utils/converters.test.ts` passing? Yes!
# Is `tests/security/PayloadMapperJit.test.ts` passing?
