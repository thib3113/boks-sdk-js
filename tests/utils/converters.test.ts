import { describe, it, expect } from 'vitest';
import {
  hexToBytes,
  bytesToHex,
  stringToBytes,
  bytesToString,
  calculateChecksum,
  bytesToMac,
  readConfigKeyFromBuffer,
  readPinFromBuffer
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

    it('should handle hex string with tabs and newlines', () => {
      const hex = '01\n02\t03\r04';
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

  describe('readConfigKeyFromBuffer', () => {
    it('should read exactly 8 characters from buffer at offset', () => {
      const buffer = new Uint8Array([0, 1, 65, 66, 67, 68, 69, 70, 48, 49, 255]); // 'ABCDEF01'
      expect(readConfigKeyFromBuffer(buffer, 2)).toBe('ABCDEF01');
    });

    it('should handle early returns for null bytes at different positions', () => {
      expect(readConfigKeyFromBuffer(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]), 0)).toBe('');
      expect(readConfigKeyFromBuffer(new Uint8Array([65, 0, 0, 0, 0, 0, 0, 0]), 0)).toBe('A');
      expect(readConfigKeyFromBuffer(new Uint8Array([65, 66, 0, 0, 0, 0, 0, 0]), 0)).toBe('AB');
      expect(readConfigKeyFromBuffer(new Uint8Array([65, 66, 67, 0, 0, 0, 0, 0]), 0)).toBe('ABC');
      expect(readConfigKeyFromBuffer(new Uint8Array([65, 66, 67, 68, 0, 0, 0, 0]), 0)).toBe('ABCD');
      expect(readConfigKeyFromBuffer(new Uint8Array([65, 66, 67, 68, 69, 0, 0, 0]), 0)).toBe(
        'ABCDE'
      );
      expect(readConfigKeyFromBuffer(new Uint8Array([65, 66, 67, 68, 69, 70, 0, 0]), 0)).toBe(
        'ABCDEF'
      );
      expect(readConfigKeyFromBuffer(new Uint8Array([65, 66, 67, 68, 69, 70, 71, 0]), 0)).toBe(
        'ABCDEFG'
      );
    });
  });

  describe('readPinFromBuffer', () => {
    it('should read exactly 6 characters from buffer at offset', () => {
      const buffer = new Uint8Array([255, 49, 50, 51, 52, 53, 54, 0]); // '123456'
      expect(readPinFromBuffer(buffer, 1)).toBe('123456');
    });

    it('should handle early returns for null bytes at different positions', () => {
      expect(readPinFromBuffer(new Uint8Array([0, 0, 0, 0, 0, 0]), 0)).toBe('');
      expect(readPinFromBuffer(new Uint8Array([49, 0, 0, 0, 0, 0]), 0)).toBe('1');
      expect(readPinFromBuffer(new Uint8Array([49, 50, 0, 0, 0, 0]), 0)).toBe('12');
      expect(readPinFromBuffer(new Uint8Array([49, 50, 51, 0, 0, 0]), 0)).toBe('123');
      expect(readPinFromBuffer(new Uint8Array([49, 50, 51, 52, 0, 0]), 0)).toBe('1234');
      expect(readPinFromBuffer(new Uint8Array([49, 50, 51, 52, 53, 0]), 0)).toBe('12345');
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
describe('bytesToMac 6-byte reverse true', () => {
  it('formats a 6-byte MAC address with reverse=true', () => {
    const bytes = new Uint8Array([0x11, 0x22, 0x33, 0x44, 0x55, 0x66]);
    expect(bytesToMac(bytes, true)).toBe('665544332211');
  });
});

describe('hexToBytes exact match', () => {
  it('covers exact match when no spaces skipped', () => {
    // Create a hex string that triggers the slow path (length > 32) but has no spaces.
    // So j === bytes.length will be true.
    const hex = '0102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122';
    const result = hexToBytes(hex);
    expect(result.length).toBe(34);
  });
});
describe('bytesToMac 7-byte reverse true', () => {
  it('formats a 7-byte MAC address with reverse=true', () => {
    const bytes = new Uint8Array([0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]);
    expect(bytesToMac(bytes, true)).toBe('77665544332211');
  });
});
describe('hexToBytes spaces but exact match buffer', () => {
  it('covers skipping spaces where buffer size needs adjusting', () => {
    // Create a hex string that triggers the slow path (length > 32) and has spaces.
    // So j !== bytes.length will be true, testing `bytes.subarray(0, j)`.
    const hex = '0102030405060708090A0B0C0D0E0F10 1112131415161718191A1B1C1D1E1F202122';
    const result = hexToBytes(hex);
    expect(result.length).toBe(34);
  });
});
