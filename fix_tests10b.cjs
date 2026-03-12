const fs = require('fs');

let bpfTest = 'tests/protocol/BoksPacketFactory.test.ts';
let codeBpf = fs.readFileSync(bpfTest, 'utf8');

// Add import
if (!codeBpf.includes("import { BoksProtocolError")) {
  codeBpf = codeBpf.replace("import { BoksOpcode } from '@/protocol/constants';", "import { BoksOpcode } from '@/protocol/constants';\nimport { BoksProtocolError } from '@/errors/BoksProtocolError';");
}

// Fix test data for NFC Found
codeBpf = codeBpf.replace(
  `{ opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload: new Uint8Array([0x01, 0x02, 0x03, 0x04]), expectedClass: 'NotifyNfcTagFoundPacket' },`,
  `{ opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload: new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]), expectedClass: 'NotifyNfcTagFoundPacket' },`
);

// We replace the expectations.
codeBpf = codeBpf.replace(
  `const result = BoksPacketFactory.createFromPayload(invalidData);\n      expect(result).toBeUndefined();`,
  `expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);`
);
codeBpf = codeBpf.replace(
  `const result = BoksPacketFactory.createFromPayload(invalidData);\n      expect(result).toBeUndefined();`,
  `expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);`
);
codeBpf = codeBpf.replace(
  `const result = BoksPacketFactory.createFromPayload(invalidData);\n      expect(result).toBeUndefined();`,
  `expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);`
);
codeBpf = codeBpf.replace(
  `const result = BoksPacketFactory.createFromPayload(invalidData, loggerMock);\n      expect(loggerMock).toHaveBeenCalled();\n      expect(result).toBeUndefined();`,
  `expect(() => BoksPacketFactory.createFromPayload(invalidData, loggerMock)).toThrow(BoksProtocolError);\n      expect(loggerMock).toHaveBeenCalled();`
);

fs.writeFileSync(bpfTest, codeBpf);

let integTest = 'tests/integration/BoksController.simulator.test.ts';
let integCode = fs.readFileSync(integTest, 'utf8');

// Update checksum logic for simulator
// Payload: [0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04] => 197+5+4+1+2+3+4 = 216 = 0xD8
integCode = integCode.replace(
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);",
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);" // was 217
);
integCode = integCode.replace(
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);",
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);" // was 217
);

// Let's actually fix the checksum correctly.
// Checksum = calculateChecksum( [0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04] )
// calculateChecksum uses bitwise & 0xFF.
// 0xC5(197) + 5 + 4 + 1 + 2 + 3 + 4 = 216
// 216 & 0xFF = 216 = 0xD8
// Let's check what the file has right now
