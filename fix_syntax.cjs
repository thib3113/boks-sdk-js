const fs = require('fs');

let code = fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf8');

// There is a SyntaxError inside tests/security/PayloadMapperJit.test.ts related to:
// return new Function('payload', 'analyzer', 'BoksProtocolError', 'BoksProtocolErrorId', ... fnBody)
//
// Let's print out the `fnBody` from the test to see what exactly is broken in eval.
