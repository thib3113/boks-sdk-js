import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksPacketFactory } from '../../../src/protocol/BoksPacketFactory';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('BoksPacketFactory Resilience (Fuzzing)', () => {
  it('should not crash on arbitrary random payloads (graceful rejection or typed error)', () => {
    // We send completely random byte arrays.
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        try {
          const result = BoksPacketFactory.createFromPayload(data);
          expect(result === undefined || typeof result === 'object').toBe(true);
        } catch (e) {
          // If it throws, it MUST be a typed error, not a native crash like TypeError/RangeError
          // (e.g., trying to read out of bounds on Uint8Array)
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
