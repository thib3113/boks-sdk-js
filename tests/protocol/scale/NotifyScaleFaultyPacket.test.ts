import { describe, it, expect } from 'vitest';
import { NotifyScaleFaultyPacket } from '@/protocol/scale/NotifyScaleFaultyPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleFaultyPacket', () => {
  it('should parse correctly with data', () => {
    const payload = new Uint8Array([0x01, 0x02]);
    const packet = NotifyScaleFaultyPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_FAULTY);
    expect(packet.data).toEqual(payload);
  });
});
