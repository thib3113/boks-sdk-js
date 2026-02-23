import { describe, it, expect } from 'vitest';
import { NotifyScaleRawSensorsPacket } from '@/protocol/scale/NotifyScaleRawSensorsPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleRawSensorsPacket', () => {
  it('should parse correctly with data', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = NotifyScaleRawSensorsPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_RAW_SENSORS);
    expect(packet.data).toEqual(payload);
  });
});
