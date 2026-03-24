import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { KeyOpeningHistoryPacket } from '../../../../../src/protocol/uplink/history/KeyOpeningHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('KeyOpeningHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = KeyOpeningHistoryPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(KeyOpeningHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
