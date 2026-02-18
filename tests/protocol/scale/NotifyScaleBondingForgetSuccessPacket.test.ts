import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingForgetSuccessPacket } from '@/protocol/scale/NotifyScaleBondingForgetSuccessPacket';

describe('NotifyScaleBondingForgetSuccessPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyScaleBondingForgetSuccessPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xB3);
  });
});



