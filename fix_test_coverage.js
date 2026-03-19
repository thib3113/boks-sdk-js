const fs = require('fs');

let fileContent = fs.readFileSync('tests/protocol/BoksPacketFactory.test.ts', 'utf8');

const missingTests = `
    it('should silently ignore register with an undefined class', () => {
      BoksPacketFactory.register(undefined as any);
      // Ensure it doesn't throw. If it does, test fails.
      expect(true).toBe(true);
    });

    it('should throw an error if RegeneratePartA or PartB is missing when creating regenerate packets', () => {
      // First, let's keep a backup of the registry
      const originalA = BoksPacketFactory.getConstructor(0x20);
      const originalB = BoksPacketFactory.getConstructor(0x21);

      // Now, let's clear it
      (BoksPacketFactory as any).registry[0x20] = undefined;
      (BoksPacketFactory as any).registry[0x21] = undefined;

      const newMasterKey = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';

      expect(() => {
        BoksPacketFactory.createRegeneratePackets('ABCDEF01', newMasterKey);
      }).toThrowError('RegeneratePartAPacket not registered');

      // Add back A, so B throws
      if (originalA) BoksPacketFactory.register(originalA);

      expect(() => {
        BoksPacketFactory.createRegeneratePackets('ABCDEF01', newMasterKey);
      }).toThrowError('RegeneratePartBPacket not registered');

      // Restore both
      if (originalA) BoksPacketFactory.register(originalA);
      if (originalB) BoksPacketFactory.register(originalB);
    });
`;

fileContent = fileContent.replace(
  /it\('should throw INVALID_VALUE error if the key length is not exactly 32 bytes', \(\) => \{[\s\S]*?\}\);/,
  `it('should throw INVALID_VALUE error if the key length is not exactly 32 bytes', () => {
      const configKey = 'ABCDEF01';
      const newMasterKey = new Uint8Array([1, 2, 3]);

      expect(() => {
        BoksPacketFactory.createRegeneratePackets(configKey, newMasterKey);
      }).toThrowError(
        expect.objectContaining({
          errorId: BoksProtocolErrorId.INVALID_VALUE
        })
      );
    });
${missingTests}`
);

fs.writeFileSync('tests/protocol/BoksPacketFactory.test.ts', fileContent, 'utf8');
