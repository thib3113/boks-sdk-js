const fs = require('fs');
let content = fs.readFileSync('src/protocol/decorators/PayloadHexString.ts', 'utf8');
content = content.replace(
  'strVal = bytesToHex(val).toLowerCase();',
  'strVal = bytesToHex(val).toUpperCase();'
);
fs.writeFileSync('src/protocol/decorators/PayloadHexString.ts', content);
