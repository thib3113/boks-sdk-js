import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RebootPacket } from '../../../src/protocol/downlink/RebootPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('RebootPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = RebootPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(RebootPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
