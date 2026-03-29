import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleMeasureWeightPacket } from '../../../../src/protocol/scale/ScaleMeasureWeightPacket';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

describe('ScaleMeasureWeightPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = ScaleMeasureWeightPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(ScaleMeasureWeightPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
