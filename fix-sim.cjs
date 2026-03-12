const fs = require('fs');
let integTest = 'tests/integration/BoksController.simulator.test.ts';
let integCode = fs.readFileSync(integTest, 'utf8');

// I will just use calculateChecksum directly in the test to dynamically set the correct byte so I don't have to calculate it manually.
integCode = integCode.replace(
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);",
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, calculateChecksum(new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04]))]);"
);
integCode = integCode.replace(
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);",
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, calculateChecksum(new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04]))]);"
);

fs.writeFileSync(integTest, integCode);
