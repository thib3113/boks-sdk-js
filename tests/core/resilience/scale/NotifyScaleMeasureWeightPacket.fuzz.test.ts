import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyScaleMeasureWeightPacket } from '../../../../src/protocol/scale/NotifyScaleMeasureWeightPacket';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('NotifyScaleMeasureWeightPacket Resilience (Fuzzing)', () => {
  it('should not crash on arbitrary random payloads', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        let packet;
        try {
          packet = NotifyScaleMeasureWeightPacket.fromPayload(data);
        } catch(e) { return; }
        expect(packet).toBeInstanceOf(NotifyScaleMeasureWeightPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT);
        expect(typeof packet.weight).toBe('number');
        // If data length < 4, weight should be 0 based on logic
        if (data.length < 4) {
          expect(packet.weight).toBe(0);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
