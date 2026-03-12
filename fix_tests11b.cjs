const fs = require('fs');

let file = 'tests/protocol/BoksPacketFactory.test.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { BoksProtocolError")) {
  code = code.replace("import { BoksOpcode } from '@/protocol/constants';", "import { BoksOpcode } from '@/protocol/constants';\nimport { BoksProtocolError } from '@/errors/BoksProtocolError';");
}

code = code.replace(
  `{ opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload: new Uint8Array([0x01, 0x02, 0x03, 0x04]), expectedClass: 'NotifyNfcTagFoundPacket' },`,
  `{ opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload: new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]), expectedClass: 'NotifyNfcTagFoundPacket' },`
);

code = code.replace(
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

code = code.replace(
  `it('should return undefined if data length is less than indicated by length byte', () => {
      const opcode = 0x77;
      const length = 5;
      const data = new Uint8Array([opcode, length, 0x01, 0x02]); // Missing 3 bytes of payload + checksum
      expect(BoksPacketFactory.createFromPayload(data)).toBeUndefined();
    });`,
  `it('should throw if data length is less than indicated by length byte', () => {
      const opcode = 0x77;
      const length = 5;
      const data = new Uint8Array([opcode, length, 0x01, 0x02]); // Missing 3 bytes of payload + checksum
      expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(BoksProtocolError);
    });`
);

code = code.replace(
  `it('should return undefined if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0xFF;
      const data = new Uint8Array([opcode, length, invalidChecksum]);

      expect(BoksPacketFactory.createFromPayload(data)).toBeUndefined();
    });`,
  `it('should throw if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0xFF;
      const data = new Uint8Array([opcode, length, invalidChecksum]);

      expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(BoksProtocolError);
    });`
);

code = code.replace(
  `it('should call logger and return undefined if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0x00; // Correct would be 0x77 + 0x00 = 0x77
      const data = new Uint8Array([opcode, length, invalidChecksum]);
      const logger = vi.fn();

      const packet = BoksPacketFactory.createFromPayload(data, logger);

      expect(packet).toBeUndefined();
      expect(logger).toHaveBeenCalledWith('warn', 'checksum_error', {
        opcode,
        expected: 0x77,
        received: 0x00
      });
    });`,
  `it('should call logger and throw if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0x00; // Correct would be 0x77 + 0x00 = 0x77
      const data = new Uint8Array([opcode, length, invalidChecksum]);
      const logger = vi.fn();

      expect(() => BoksPacketFactory.createFromPayload(data, logger)).toThrow(BoksProtocolError);
      expect(logger).toHaveBeenCalledWith('warn', 'checksum_error', {
        opcode,
        expected: 0x77,
        received: 0x00
      });
    });`
);

fs.writeFileSync(file, code);
