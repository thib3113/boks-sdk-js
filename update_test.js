const fs = require('fs');

const path = 'tests/protocol/downlink/GenerateCodesPacket.test.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace the failing test block with a block that manipulates the internal property
const newTest = `
  describe('error handling', () => {
    it('should throw Error if seed length is not exactly 32 bytes in toPayload', () => {
      // Create valid packet first
      const validSeedStr = '00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF';
      const packet = new GenerateCodesPacket(validSeedStr);

      // Forcefully alter the internal seed string directly to bypass constructor validation
      (packet as any).seedStr = '00112233445566778899AABBCCDDEEFF';

      expect(() => {
        packet.toPayload();
      }).toThrowError('Seed must be exactly 32 bytes');
    });
  });
`;

code = code.replace(/describe\('error handling', \(\) => \{[\s\S]+?\}\);/, newTest.trim());
fs.writeFileSync(path, code);
