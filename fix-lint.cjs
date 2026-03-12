const fs = require('fs');
let file = 'src/protocol/_BoksPacketBase.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  "import { calculateChecksum, bytesToHex, hexToBytes } from '@/utils/converters';",
  "import { calculateChecksum, bytesToHex } from '@/utils/converters';"
);
fs.writeFileSync(file, code);
