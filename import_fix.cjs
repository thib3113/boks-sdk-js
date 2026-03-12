const fs = require('fs');

let testFile = 'tests/protocol/BoksPacketFactory.test.ts';
let code = fs.readFileSync(testFile, 'utf8');

code = "import { BoksProtocolError } from '@/errors/BoksProtocolError';\n" + code;
fs.writeFileSync(testFile, code);
