import { describe, it, expect } from 'vitest';
import { NotifyScaleTareEmptyOkPacket } from '@/protocol/scale/NotifyScaleTareEmptyOkPacket';

describe('NotifyScaleTareEmptyOkPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyScaleTareEmptyOkPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xB5);
  });
});



