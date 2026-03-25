import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { ScaleMeasureHistoryPacket } from '../../../../../src/protocol/uplink/history/ScaleMeasureHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';
import { buildMockRawPacket } from '../../../../../utils/packet-builder';

describe('ScaleMeasureHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: ScaleMeasureHistoryPacket should safely handle arbitrary payload lengths without native errors', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = ScaleMeasureHistoryPacket.fromRaw(buildMockRawPacket(ScaleMeasureHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(ScaleMeasureHistoryPacket);
          expect(packet.opcode).toBe(ScaleMeasureHistoryPacket.opcode);
        } catch (e: any) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
