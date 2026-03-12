const fs = require('fs');

let bpfTest = 'tests/protocol/BoksPacketFactory.test.ts';
let bpfCode = fs.readFileSync(bpfTest, 'utf8');

// The reason it fails is because BoksPacketFactory.test.ts expects `createFromPayload` to return undefined OR it's not actually catching the thrown error correctly using a proper arrow function inside expect.
// Oh, the stack trace shows it's actually throwing during `expect(() => ...)` and failing? No, wait.
// "FAIL tests/protocol/BoksPacketFactory.test.ts > BoksPacketFactory > createFromPayload error handling > should throw if data length is less than 3"
// Wait, if it fails, it means we didn't write `expect(() => ...).toThrow()`. We probably wrote `expect(() => BoksPacketFactory.createFromPayload()).toThrow()` but maybe the payload was somehow valid, or we didn't wrap the original call correctly.

// Let's rewrite the error handling describe block entirely.
bpfCode = bpfCode.replace(
  /describe\('createFromPayload error handling', \(\) => {[\s\S]*?}\);/g,
  `describe('createFromPayload error handling', () => {
    it('should throw if data length is less than 3', () => {
      const invalidData = new Uint8Array([0x01, 0x02]);
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });

    it('should throw if data length is less than indicated by length byte', () => {
      const invalidData = new Uint8Array([0x01, 0x05, 0x03, 0x04]); // Length says 5, but only 2 bytes payload
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });

    it('should throw if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xFF]); // Invalid checksum
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });

    it('should call logger and throw if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xFF]); // Invalid checksum
      const loggerMock = vi.fn();
      expect(() => BoksPacketFactory.createFromPayload(invalidData, loggerMock)).toThrow(BoksProtocolError);
      expect(loggerMock).toHaveBeenCalled();
    });
  });`
);
// Import BoksProtocolError if missing
if (!bpfCode.includes("import { BoksProtocolError")) {
  bpfCode = bpfCode.replace("import { BoksOpcode } from '@/protocol/constants';", "import { BoksOpcode } from '@/protocol/constants';\nimport { BoksProtocolError } from '@/errors/BoksProtocolError';");
}

fs.writeFileSync(bpfTest, bpfCode);


let integTest = 'tests/integration/BoksController.simulator.test.ts';
let integCode = fs.readFileSync(integTest, 'utf8');

// Update checksum logic for simulator
// Payload: [0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04] => 197+5+4+1+2+3+4 = 216 = 0xD8
integCode = integCode.replace(
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 217]);",
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);"
);
integCode = integCode.replace(
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 217]);",
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 216]);"
);

fs.writeFileSync(integTest, integCode);
