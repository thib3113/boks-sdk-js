const fs = require('fs');
const file = './tests/security/PayloadMapperJit.test.ts';
let code = fs.readFileSync(file, 'utf8');

const newTest = `
  describe('Double field instances to catch JIT syntax errors', () => {
    it('should not throw a SyntaxError when multiple pin_code and config_key fields exist', () => {
      class MultiplePinsConfigKeysPacket {
        pin1;
        pin2;
        key1;
        key2;
      }
      PayloadMapper.defineSchema(MultiplePinsConfigKeysPacket, [
        { propertyName: 'pin1', type: 'pin_code', offset: 0 },
        { propertyName: 'pin2', type: 'pin_code', offset: 6 },
        { propertyName: 'key1', type: 'config_key', offset: 12 },
        { propertyName: 'key2', type: 'config_key', offset: 20 },
      ]);

      // If block scoping was not properly applied in PayloadMapper.ts,
      // compiling the JIT parser will throw "SyntaxError: Identifier 'p' has already been declared".
      expect(() => {
        PayloadMapper.parse(MultiplePinsConfigKeysPacket, new Uint8Array(28).fill(48)); // Fill with '0'
      }).not.toThrow();
    });
  });
`;

// Insert the new test suite before the very last `});`
const insertIdx = code.lastIndexOf('});');
if (insertIdx !== -1) {
  code = code.substring(0, insertIdx) + newTest + code.substring(insertIdx);
  fs.writeFileSync(file, code);
  console.log('Patched');
} else {
  console.log('Could not find last });');
}
