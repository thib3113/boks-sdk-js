import { describe, it, expect } from 'vitest';
import { ScaleMeasureHistoryPacket } from '@/protocol/uplink/history/ScaleMeasureHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ScaleMeasureHistoryPacket', () => {
  it('should parse correctly with age and data', () => {
    // 0x01, 0x02, 0x03, 0x04 -> Data
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01, 0x02, 0x03, 0x04]);
    const packet = ScaleMeasureHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_SCALE_MEASURE);
    expect(packet.age).toBe(10);
    expect(packet.data).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
  });

  it('should handle missing data', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0A]);
    const packet = ScaleMeasureHistoryPacket.fromPayload(payload);
    expect(packet.data.length).toBe(0);
  });
});
