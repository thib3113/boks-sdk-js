const fs = require('fs');

let integTest = 'tests/integration/BoksController.simulator.test.ts';
let integCode = fs.readFileSync(integTest, 'utf8');

// I need to hardcode the checksum properly.
// 0xC5(197) + 5(len) + 4(uidLen) + 1 + 2 + 3 + 4 = 216
// So calculateChecksum should be 216.
integCode = integCode.replace(
  "calculateChecksum(new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04]))",
  "216"
);

// Wait, the payload sent to simulator needs to match the structure for "notify NFC tag found".
// It needs to trigger `simulateNfcScan` and be processed by the RX handler.
// `simulateNfcScan` in BoksSimulator creates a packet if no mock is provided:
// `new Uint8Array([BoksOpcode.NOTIFY_NFC_TAG_FOUND, 0x08, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, checksum])`
// But we modified the length expected for NFC to throw on > 4!
// Aaaah! In BoksSimulator.ts it's simulating a scan with an 8-byte UID `[0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]`.
// BoksSimulator.ts line ~140. I need to change it to simulate a 4-byte UID.
