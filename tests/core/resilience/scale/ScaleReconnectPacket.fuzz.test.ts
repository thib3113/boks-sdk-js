import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleReconnectPacket } from '../../../../src/protocol/scale/ScaleReconnectPacket';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

describe('ScaleReconnectPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = ScaleReconnectPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(ScaleReconnectPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
