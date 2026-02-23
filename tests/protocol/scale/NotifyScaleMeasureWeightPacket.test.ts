import { describe, it, expect } from 'vitest';
import { NotifyScaleMeasureWeightPacket } from '@/protocol/scale/NotifyScaleMeasureWeightPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleMeasureWeightPacket', () => {
  it('should parse positive weight', () => {
    // 0x00 Sign + Value 0x0003E8 (1000)
    const payload = new Uint8Array([0x00, 0x00, 0x03, 0xE8]);
    const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT);
    expect(packet.weight).toBe(1000);
  });

  it('should parse negative weight', () => {
    // 0x01 Sign + Value 0x0003E8 (1000) -> -1000
    const payload = new Uint8Array([0x01, 0x00, 0x03, 0xE8]);
    const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
    expect(packet.weight).toBe(-1000);
  });

  it('should handle short payload (default 0)', () => {
    const payload = new Uint8Array(2);
    const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
    expect(packet.weight).toBe(0);
  });
});
