const fs = require('fs');

let file = 'tests/protocol/BoksPacketFactory.test.ts';
let code = fs.readFileSync(file, 'utf8');

// Find the last '});' and remove it.
let lastIndex = code.lastIndexOf('});');
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + code.substring(lastIndex + 3);
}

fs.writeFileSync(file, code);

let open = (code.match(/\{/g) || []).length;
let close = (code.match(/\}/g) || []).length;
console.log('Open:', open, 'Close:', close);
