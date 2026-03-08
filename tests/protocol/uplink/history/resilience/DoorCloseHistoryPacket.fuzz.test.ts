import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DoorCloseHistoryPacket } from '../../../../../src/protocol/uplink/history/DoorCloseHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('DoorCloseHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = DoorCloseHistoryPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(DoorCloseHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
