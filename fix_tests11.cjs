const fs = require('fs');

let testFile = 'tests/protocol/BoksPacketFactory.test.ts';
let code = fs.readFileSync(testFile, 'utf8');

// Fix syntax error by re-applying the block correctly.
// At the end of `describe('createFromPayload error handling', () => {`, there is an extra describe closing brace `});` or duplicate tests. Let's rebuild the file manually using git checkout.
