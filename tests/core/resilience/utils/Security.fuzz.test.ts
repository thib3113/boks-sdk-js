import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sealed, freeze } from '../../../../src/utils/security';

describe('Security Utils Resilience (Fuzzing)', () => {

  it('FEATURE REGRESSION: sealed should not throw when sealing classes', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (name) => {
        class Dummy {}
        Object.defineProperty(Dummy, 'name', { value: name });
        sealed(Dummy, {} as any);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(Object.isSealed(Dummy)).toBe(true);
        expect(Object.isSealed(Dummy.prototype)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('FEATURE REGRESSION: freeze should not throw when freezing classes', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (name) => {
        class Dummy {}
        Object.defineProperty(Dummy, 'name', { value: name });
        freeze(Dummy, {} as any);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(Object.isFrozen(Dummy)).toBe(true);
        expect(Object.isFrozen(Dummy.prototype)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
