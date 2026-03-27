import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DoorOpenHistoryPacket } from '../../../../../src/protocol/uplink/history/DoorOpenHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('DoorOpenHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = DoorOpenHistoryPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(DoorOpenHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
