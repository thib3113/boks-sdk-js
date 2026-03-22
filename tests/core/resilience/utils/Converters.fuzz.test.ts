import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  hexToBytes,
  bytesToHex,
    stringToBytes,
  readConfigKeyFromBuffer,
  readPinFromBuffer,
  writeConfigKeyToBuffer,
  bytesToString
} from '../../../../src/utils/converters';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

describe('Converters Utils Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: hexToBytes should safely handle arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        try {
          const result = hexToBytes(str);
          expect(result).toBeInstanceOf(Uint8Array);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: bytesToHex should safely handle arbitrary bytes', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (bytes) => {
        const result = bytesToHex(bytes);
        expect(typeof result).toBe('string');
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION:  should safely handle arbitrary lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), fc.boolean(), (arr, reverse) => {
        const result = bytesToHex(arr, { reverse });
        expect(typeof result).toBe('string');
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: stringToBytes should safely handle arbitrary UTF-8 bounds', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const bytes = stringToBytes(str);
        expect(bytes).toBeInstanceOf(Uint8Array);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: readConfigKeyFromBuffer should safely handle out of bounds reading', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        fc.integer({ min: -10, max: 300 }),
        (arr, offset) => {
          const result = readConfigKeyFromBuffer(arr, offset);
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: readPinFromBuffer should safely handle out of bounds reading', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        fc.integer({ min: -10, max: 300 }),
        (arr, offset) => {
          const result = readPinFromBuffer(arr, offset);
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: writeConfigKeyToBuffer should safely handle out of bounds writing', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        fc.integer({ min: -10, max: 300 }),
        fc.string(),
        (arr, offset, str) => {
          try {
            writeConfigKeyToBuffer(arr, offset, str);
          } catch (e) {
            // Out of bounds or string too short
            expect(e instanceof TypeError || e instanceof RangeError).toBe(true);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: bytesToString should safely handle arbitrary UTF-8 bounds and null characters', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (bytes) => {
        const result = bytesToString(bytes);
        expect(typeof result).toBe('string');
        // also check that no null bytes exist in the parsed string
        expect(result.indexOf('\x00')).toBe(-1);
      }),
      { numRuns: 1000 }
    );
  });
});
