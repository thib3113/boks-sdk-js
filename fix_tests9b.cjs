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

// Replace undefined expects with toThrow
codeBpf = codeBpf.replace(
  `it('should return undefined if data length is less than 3', () => {
      const invalidData = new Uint8Array([0x01, 0x02]);
      const result = BoksPacketFactory.createFromPayload(invalidData);
      expect(result).toBeUndefined();
    });`,
  `it('should throw if data length is less than 3', () => {
      const invalidData = new Uint8Array([0x01, 0x02]);
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });`
);

codeBpf = codeBpf.replace(
  `it('should return undefined if data length is less than indicated by length byte', () => {
      const invalidData = new Uint8Array([0x01, 0x05, 0x03, 0x04]); // Length says 5, but only 2 bytes payload
      const result = BoksPacketFactory.createFromPayload(invalidData);
      expect(result).toBeUndefined();
    });`,
  `it('should throw if data length is less than indicated by length byte', () => {
      const invalidData = new Uint8Array([0x01, 0x05, 0x03, 0x04]); // Length says 5, but only 2 bytes payload
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });`
);

codeBpf = codeBpf.replace(
  `it('should return undefined if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xFF]); // Invalid checksum
      const result = BoksPacketFactory.createFromPayload(invalidData);
      expect(result).toBeUndefined();
    });`,
  `it('should throw if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xFF]); // Invalid checksum
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });`
);

codeBpf = codeBpf.replace(
  `it('should call logger and return undefined if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xFF]); // Invalid checksum
      const loggerMock = vi.fn();
      const result = BoksPacketFactory.createFromPayload(invalidData, loggerMock);
      expect(loggerMock).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });`,
  `it('should call logger and throw if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xFF]); // Invalid checksum
      const loggerMock = vi.fn();
      expect(() => BoksPacketFactory.createFromPayload(invalidData, loggerMock)).toThrow(BoksProtocolError);
      expect(loggerMock).toHaveBeenCalled();
    });`
);

fs.writeFileSync(bpfTest, codeBpf);
