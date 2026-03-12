const fs = require('fs');

let integTest = 'tests/integration/BoksController.simulator.test.ts';
let integCode = fs.readFileSync(integTest, 'utf8');

integCode = integCode.replace(
  /new Uint8Array\(\[0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, (.*?)]\)/g,
  "new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216])"
);

fs.writeFileSync(integTest, integCode);
