import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  hexToBytes,
  bytesToHex,
  bytesToMac,
  stringToBytes,
  bytesToString,
  calculateChecksum,
  writeConfigKeyToBuffer,
  readPinFromBuffer,
  readConfigKeyFromBuffer
} from '../../../src/utils/converters';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('converters Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: hexToBytes should safely handle arbitrary strings without crashing', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 1000 }), (hex) => {
        try {
          const bytes = hexToBytes(hex);
          expect(bytes).toBeInstanceOf(Uint8Array);
          // If it didn't throw, it must have been valid hex (optionally with spaces/hyphens)
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: hexToBytes -> bytesToHex roundtrip should work for valid hex', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 1000 }), (bytes) => {
        const hex = bytesToHex(bytes);
        const parsedBytes = hexToBytes(hex);
        expect(parsedBytes).toEqual(bytes);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: bytesToMac should not crash on arbitrary arrays', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 1000 }), fc.boolean(), (bytes, reverse) => {
        const mac = bytesToMac(bytes, reverse);
        expect(typeof mac).toBe('string');
        if (bytes.length === 0) {
          expect(mac).toBe('');
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: stringToBytes -> bytesToString roundtrip should work', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 1000 }), (str) => {
        const bytes = stringToBytes(str);
        const decoded = bytesToString(bytes);
        // decoded might drop null bytes, so we remove them from original str for comparison
        const expected = str.replace(/\0/g, '');
        expect(decoded).toBe(expected);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: calculateChecksum should not crash on arbitrary arrays and always return 0-255', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 1000 }), (bytes) => {
        const checksum = calculateChecksum(bytes);
        expect(typeof checksum).toBe('number');
        expect(checksum).toBeGreaterThanOrEqual(0);
        expect(checksum).toBeLessThanOrEqual(255);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: writeConfigKeyToBuffer should not crash and write successfully if buffer is large enough', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        fc.string({ minLength: 8, maxLength: 8 }),
        fc.integer({ min: 0, max: 256 }),
        (buffer, key, offset) => {
          // JS Uint8Array ignores writes out-of-bounds, so this shouldn't crash
          writeConfigKeyToBuffer(buffer, offset, key);

          if (offset + 8 <= buffer.length) {
            expect(readConfigKeyFromBuffer(buffer, offset)).toBe(key);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: readPinFromBuffer should not crash and return a string even if buffer is out of bounds', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        fc.integer({ min: -10, max: 300 }),
        (buffer, offset) => {
          const result = readPinFromBuffer(buffer, offset);
          expect(typeof result).toBe('string');
          expect(result.length).toBeLessThanOrEqual(6);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: readConfigKeyFromBuffer should not crash and return a string even if buffer is out of bounds', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        fc.integer({ min: -10, max: 300 }),
        (buffer, offset) => {
          const result = readConfigKeyFromBuffer(buffer, offset);
          expect(typeof result).toBe('string');
          expect(result.length).toBeLessThanOrEqual(8);
        }
      ),
      { numRuns: 1000 }
    );
  });
});
