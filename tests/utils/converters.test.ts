import { describe, it, expect } from 'vitest';
import { hexToBytes, bytesToHex } from '../../src/utils/converters';

describe('converters', () => {
  describe('hexToBytes', () => {
    it('should convert valid hex string to bytes', () => {
      const hex = '01020304';
      const bytes = hexToBytes(hex);
      expect(bytes).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it('should handle hex string with spaces', () => {
      const hex = '01 02 03 04';
      const bytes = hexToBytes(hex);
      expect(bytes).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it('should throw on lowercase characters (uppercase only required)', () => {
      expect(() => hexToBytes('a1B2c3D4')).toThrow('Invalid hex character');
    });

    it('should throw if length is odd (after removing spaces)', () => {
      expect(() => hexToBytes('010')).toThrow('Invalid hex string');
    });

    it('should throw on invalid characters (strict mode)', () => {
      expect(() => hexToBytes('G1')).toThrow('Invalid hex character');
      expect(() => hexToBytes('1G')).toThrow('Invalid hex character');
    });
  });

  describe('bytesToHex', () => {
    it('should convert bytes to hex string', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 10, 15, 255]);
      const hex = bytesToHex(bytes);
      expect(hex).toBe('010203040A0FFF');
    });
  });
});
