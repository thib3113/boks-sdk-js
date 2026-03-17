import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { parseBatteryLevel, parseBatteryStats } from '../../../../src/utils/battery';
import { INVALID_BYTE } from '../../../../src/protocol/constants';

describe('Battery Utils Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: parseBatteryLevel should safely handle arbitrary payload lengths and bytes', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (arr) => {
        const result = parseBatteryLevel(arr);
        if (!arr || arr.length === 0 || arr[0] === INVALID_BYTE) {
          expect(result).toBeUndefined();
        } else {
          // Check valid outputs, it just returns arr[0]
          expect(result).toBe(arr[0]);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: parseBatteryStats should safely handle arbitrary payload lengths and bytes', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (arr) => {
        const result = parseBatteryStats(arr);
        if (!arr || arr.length === 0 || Array.from(arr).every((b) => b === INVALID_BYTE)) {
          expect(result).toBeUndefined();
        } else if (arr.length === 4) {
          expect(result).toBeDefined();
          expect(result?.format).toBe('measures-t1-t5-t10');
          expect(result?.level).toBe(arr[0]);
        } else if (arr.length === 6) {
          expect(result).toBeDefined();
          expect(result?.format).toBe('measures-first-min-mean-max-last');
          expect(result?.level).toBe(arr[2]);
        } else {
          expect(result).toBeUndefined();
        }
      }),
      { numRuns: 1000 }
    );
  });
});
