import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingProgressPacket } from '@/protocol/scale/NotifyScaleBondingProgressPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyScaleBondingProgressPacket', () => {
  it('should parse progress correctly', () => {
    const packet = new NotifyScaleBondingProgressPacket();
    packet.parse(hexToBytes('32'));
    expect(packet.progress).toBe(50);
  });
});



