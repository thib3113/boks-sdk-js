const fs = require('fs');

const path = 'tests/protocol/resilience/payload-mapper.security.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/expected: BoksExpectedReason\.NUMBER/g, 'expected: BoksExpectedReason.BIT_INDEX');

fs.writeFileSync(path, code);
