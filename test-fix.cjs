const fs = require('fs');

let t1 = 'tests/protocol/BoksPacketFactory.test.ts';
let c1 = fs.readFileSync(t1, 'utf8');

const regex = /describe\('createFromPayload error handling', \(\) => {[\s\S]*?}\);[\s\S]*?}\);[\s\S]*?}\);/g;

// I'll just write exactly what it should be.
const block = `
  describe('createFromPayload error handling', () => {
    it('should throw if data length is less than 3', () => {
      const invalidData = new Uint8Array([0x01, 0x02]);
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });

    it('should throw if data length is less than indicated by length byte', () => {
      const opcode = 0x77;
      const length = 5;
      const data = new Uint8Array([opcode, length, 0x01, 0x02]);
      expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(BoksProtocolError);
    });

    it('should throw if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0xFF;
      const data = new Uint8Array([opcode, length, invalidChecksum]);
      expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(BoksProtocolError);
    });

    it('should call logger and throw if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0x00;
      const data = new Uint8Array([opcode, length, invalidChecksum]);
      const logger = vi.fn();

      expect(() => BoksPacketFactory.createFromPayload(data, logger)).toThrow(BoksProtocolError);
      expect(logger).toHaveBeenCalledWith('warn', 'checksum_error', {
        opcode,
        expected: 0x77,
        received: 0x00
      });
    });

    it('should return undefined for unknown opcode', () => {
      const unknownOpcode = 0xFF;
      const length = 0;
      const data = new Uint8Array([unknownOpcode, length]);
      const checksum = calculateChecksum(data);
      const fullData = new Uint8Array([unknownOpcode, length, checksum]);

      expect(BoksPacketFactory.createFromPayload(fullData)).toBeUndefined();
    });
  });
`;

c1 = c1.replace(/describe\('createFromPayload error handling', \(\) => \{[\s\S]*?\}\);\n  \}\);/g, block);
// Wait the syntax error is an extra "});"
// I will just use sed to fix it.
