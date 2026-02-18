import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingSuccessPacket } from '@/protocol/scale/NotifyScaleBondingSuccessPacket';

describe('NotifyScaleBondingSuccessPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyScaleBondingSuccessPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xB0);
  });
});



