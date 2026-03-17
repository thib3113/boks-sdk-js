const fs = require('fs');

const path = 'src/protocol/decorators/PayloadMapper.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/expected: BoksExpectedReason\.NUMBER/g, 'expected: BoksExpectedReason.BIT_INDEX');

fs.writeFileSync(path, code);
