import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingSuccessPacket } from '@/protocol/scale/NotifyScaleBondingSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleBondingSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyScaleBondingSuccessPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_SUCCESS);
  });
});
