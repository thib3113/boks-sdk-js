import re

with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

test_to_fix = """    it('should gracefully ignore invalid characters', () => {
      const bytes1 = hexToBytes('G1');
      expect(bytes1).toEqual(new Uint8Array([])); // '1' is odd length, so actually it should throw ODD_LENGTH!
      // Let's test a valid outcome: 'G12' -> ignores G, parses '12'
      const bytes2 = hexToBytes('G12');
      expect(bytes2).toEqual(new Uint8Array([0x12]));
    });"""

test_fixed = """    it('should gracefully ignore invalid characters', () => {
      expect(() => hexToBytes('G1')).toThrow('ODD_LENGTH'); // '1' is odd length
      const bytes2 = hexToBytes('G12');
      expect(bytes2).toEqual(new Uint8Array([0x12]));
    });"""

content = content.replace(test_to_fix, test_fixed)

with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
