import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { parseBatteryLevel, parseBatteryStats } from '../../../../src/utils/battery';

describe('Battery Utils Resilience (Fuzzing)', () => {

  it('FEATURE REGRESSION: parseBatteryLevel should safely handle arbitrary payload lengths and bytes', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (arr) => {
        const result = parseBatteryLevel(arr);
        if (arr.length === 0 || arr[0] === 0xFF) {
            expect(result).toBeUndefined();
        } else {
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
        if (arr.length === 0 || Array.from(arr).every((b) => b === 0xFF)) {
            expect(result).toBeUndefined();
        } else if (arr.length === 4 || arr.length === 6) {
            expect(result).toBeDefined();
        } else {
            expect(result).toBeUndefined();
        }
      }),
      { numRuns: 1000 }
    );
  });
});
