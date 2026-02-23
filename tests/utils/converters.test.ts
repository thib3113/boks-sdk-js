import { describe, it, expect } from 'vitest';
import {
  hexToBytes,
  bytesToHex,
  stringToBytes,
  bytesToString,
  calculateChecksum,
} from '../../src/utils/converters';
import { BoksProtocolErrorId } from '../../src/errors/BoksProtocolError';

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
      expect(() => hexToBytes('a1B2c3D4')).toThrow(BoksProtocolErrorId.INVALID_VALUE);
    });

    it('should throw if length is odd (after removing spaces)', () => {
      expect(() => hexToBytes('010')).toThrow(BoksProtocolErrorId.INVALID_VALUE);
    });

    it('should throw on invalid characters (strict mode)', () => {
      expect(() => hexToBytes('G1')).toThrow(BoksProtocolErrorId.INVALID_VALUE);
      expect(() => hexToBytes('1G')).toThrow(BoksProtocolErrorId.INVALID_VALUE);
    });

    it('should throw on unicode characters > 255', () => {
      expect(() => hexToBytes('€€')).toThrow(BoksProtocolErrorId.INVALID_VALUE);
    });
  });

  describe('bytesToHex', () => {
    it('should convert bytes to hex string', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 10, 15, 255]);
      const hex = bytesToHex(bytes);
      expect(hex).toBe('010203040A0FFF');
    });
  });

  describe('stringToBytes', () => {
    it('should convert ASCII string to bytes', () => {
      const str = 'Hello';
      const bytes = stringToBytes(str);
      expect(bytes).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('should convert UTF-8 string with emojis to bytes', () => {
      const str = '👋';
      const bytes = stringToBytes(str);
      // 👋 is F0 9F 91 8B in UTF-8
      expect(bytes).toEqual(new Uint8Array([0xf0, 0x9f, 0x91, 0x8b]));
    });

    it('should handle empty string', () => {
      expect(stringToBytes('')).toEqual(new Uint8Array(0));
    });
  });

  describe('bytesToString', () => {
    it('should convert bytes to ASCII string', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      expect(bytesToString(bytes)).toBe('Hello');
    });

    it('should convert UTF-8 bytes to string', () => {
      const bytes = new Uint8Array([0xf0, 0x9f, 0x91, 0x8b]);
      expect(bytesToString(bytes)).toBe('👋');
    });

    it('should remove null characters', () => {
      const bytes = new Uint8Array([72, 101, 0, 108, 108, 111, 0]);
      expect(bytesToString(bytes)).toBe('Hello');
    });

    it('should handle empty bytes', () => {
      expect(bytesToString(new Uint8Array(0))).toBe('');
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate checksum for sum < 256', () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      expect(calculateChecksum(data)).toBe(10);
    });

    it('should calculate checksum for sum > 256 (overflow)', () => {
      const data = new Uint8Array([200, 100]); // sum = 300
      // 300 & 0xFF = 44
      expect(calculateChecksum(data)).toBe(44);
    });

    it('should return 0 for empty array', () => {
      expect(calculateChecksum(new Uint8Array(0))).toBe(0);
    });

    it('should handle array with 0xFF values', () => {
      const data = new Uint8Array([0xff, 0xff]); // sum = 510
      // 510 & 0xFF = 254
      expect(calculateChecksum(data)).toBe(254);
    });
  });
});
