import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingForgetSuccessPacket } from '@/protocol/scale/NotifyScaleBondingForgetSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleBondingForgetSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyScaleBondingForgetSuccessPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_FORGET_SUCCESS);
  });
});
