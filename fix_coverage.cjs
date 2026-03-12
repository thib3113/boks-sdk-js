const fs = require('fs');

const file = 'src/protocol/payload-mapper.ts';
let data = fs.readFileSync(file, 'utf8');

// The new decorator lacks /* v8 ignore next 3 */ which PayloadPinCode has
// We need it to ignore coverage for the undefined check
data = data.replace(
  'if (val === undefined || val === null) {',
  '/* v8 ignore next 3 */\n        if (val === undefined || val === null) {'
);

fs.writeFileSync(file, data);
console.log('Fixed coverage for new decorator');
