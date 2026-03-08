import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NfcOpeningHistoryPacket } from '../../../../../src/protocol/uplink/history/NfcOpeningHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('NfcOpeningHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = NfcOpeningHistoryPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NfcOpeningHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
