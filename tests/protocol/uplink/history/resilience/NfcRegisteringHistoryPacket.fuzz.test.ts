import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NfcRegisteringHistoryPacket } from '../../../../../src/protocol/uplink/history/NfcRegisteringHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('NfcRegisteringHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = NfcRegisteringHistoryPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NfcRegisteringHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
