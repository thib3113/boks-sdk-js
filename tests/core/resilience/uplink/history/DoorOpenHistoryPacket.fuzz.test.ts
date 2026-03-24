import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { DoorOpenHistoryPacket } from '../../../../../src/protocol/uplink/history/DoorOpenHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('DoorOpenHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: DoorOpenHistoryPacket should safely handle arbitrary payload lengths without native errors', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = DoorOpenHistoryPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(DoorOpenHistoryPacket);
          expect(packet.opcode).toBe(DoorOpenHistoryPacket.opcode);
        } catch (e: any) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
