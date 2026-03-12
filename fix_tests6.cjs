const fs = require('fs');

let boksTest = 'tests/integration/BoksController.simulator.test.ts';
let bCode = fs.readFileSync(boksTest, 'utf8');
bCode = bCode.replace(
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x04, 0x04, 0x01, 0x02, 0x03, 0x04]); // 4-byte UID + Checksum maybe?",
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 0xD4]);"
);
bCode = bCode.replace(
  "const payload = new Uint8Array([0xC5, 0x04, 0x04, 0x01, 0x02, 0x03, 0x04, 0xD7]);",
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 0xD4]);"
);
fs.writeFileSync(boksTest, bCode);

let bpfTest = 'tests/protocol/BoksPacketFactory.test.ts';
let bpfCode = fs.readFileSync(bpfTest, 'utf8');
bpfCode = bpfCode.replace(
  `{ opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload: new Uint8Array([0x01, 0x02, 0x03, 0x04]), expectedClass: 'NotifyNfcTagFoundPacket' },`,
  `{ opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload: new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]), expectedClass: 'NotifyNfcTagFoundPacket' },`
);
fs.writeFileSync(bpfTest, bpfCode);

let fTest = 'tests/protocol/BoksPacketFormatting.test.ts';
let fCode = fs.readFileSync(fTest, 'utf8');
fCode = fCode.replace(
  "expect(packet.testFormatNfcUid('01:02:ab:04')).toBe('01:02:AB:04');",
  "expect(packet.testFormatNfcUid('01:02:ab:04')).toBe('0102AB04');"
);
fCode = fCode.replace(
  "expect(packet.testFormatNfcUid('01:02:ab:04:05:06:07')).toBe('01:02:AB:04:05:06:07');",
  "expect(packet.testFormatNfcUid('01:02:ab:04:05:06:07')).toBe('0102AB04050607');"
);
fCode = fCode.replace(
  "expect(packet.testFormatNfcUid('01:02:ab:04:05:06:07:08:09:0a')).toBe('01:02:AB:04:05:06:07:08:09:0A');",
  "expect(packet.testFormatNfcUid('01:02:ab:04:05:06:07:08:09:0a')).toBe('0102AB0405060708090A');"
);
fs.writeFileSync(fTest, fCode);

let fuzzTest = 'tests/protocol/uplink/resilience/NotifyNfcTagFoundPacket.resilience.test.ts';
if (fs.existsSync(fuzzTest)) {
  let fuzzCode = fs.readFileSync(fuzzTest, 'utf8');
  fuzzCode = fuzzCode.replace(
    "const { BoksProtocolError } = require('@/errors/BoksProtocolError');",
    "import { BoksProtocolError } from '@/errors/BoksProtocolError';"
  );
  fuzzCode = fuzzCode.replace(
    `describe('fromPayload()', () => {
  import { BoksProtocolError } from '@/errors/BoksProtocolError';`,
    `import { BoksProtocolError } from '@/errors/BoksProtocolError';\n  describe('fromPayload()', () => {`
  );
  fs.writeFileSync(fuzzTest, fuzzCode);
}
