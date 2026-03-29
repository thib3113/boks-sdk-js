import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleTareEmptyPacket } from '../../../../src/protocol/scale/ScaleTareEmptyPacket';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

describe('ScaleTareEmptyPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = ScaleTareEmptyPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(ScaleTareEmptyPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
