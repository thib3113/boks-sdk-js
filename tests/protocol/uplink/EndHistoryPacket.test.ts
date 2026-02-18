import { describe, it, expect } from 'vitest';
import { EndHistoryPacket } from '@/protocol/uplink/EndHistoryPacket';

describe('EndHistoryPacket', () => {
  it('should parse correctly', () => {
    const packet = new EndHistoryPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0x92);
  });
});



