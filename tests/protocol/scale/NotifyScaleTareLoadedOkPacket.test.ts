import { describe, it, expect } from 'vitest';
import { NotifyScaleTareLoadedOkPacket } from '@/protocol/scale/NotifyScaleTareLoadedOkPacket';

describe('NotifyScaleTareLoadedOkPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyScaleTareLoadedOkPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xB6);
  });
});



