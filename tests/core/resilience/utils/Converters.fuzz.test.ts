import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { hexToBytes, bytesToMac, stringToBytes, readConfigKeyFromBuffer, readPinFromBuffer, writeConfigKeyToBuffer } from '../../../../src/utils/converters';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

describe('Converters Utils Resilience (Fuzzing)', () => {

  it('FEATURE REGRESSION: hexToBytes should safely handle arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        try {
          hexToBytes(str);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: bytesToMac should safely handle arbitrary lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), fc.boolean(), (arr, reverse) => {
        const result = bytesToMac(arr, reverse);
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
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), fc.integer({ min: -10, max: 300 }), (arr, offset) => {
        const result = readConfigKeyFromBuffer(arr, offset);
        expect(typeof result).toBe('string');
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: readPinFromBuffer should safely handle out of bounds reading', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), fc.integer({ min: -10, max: 300 }), (arr, offset) => {
        const result = readPinFromBuffer(arr, offset);
        expect(typeof result).toBe('string');
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: writeConfigKeyToBuffer should safely handle out of bounds writing', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), fc.integer({ min: -10, max: 300 }), fc.string(), (arr, offset, str) => {
        try {
          writeConfigKeyToBuffer(arr, offset, str);
        } catch (e) {
            // TypeError or RangeError might be thrown for out of bounds access, ensure it is not crashing native extensions
            expect(e).toBeInstanceOf(TypeError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
