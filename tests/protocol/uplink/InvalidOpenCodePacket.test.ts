import { describe, it, expect } from 'vitest';
import { InvalidOpenCodePacket } from '@/protocol';

describe('InvalidOpenCodePacket', () => {
  it('should parse correctly', () => {
    const packet = new InvalidOpenCodePacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0x82);
  });
});


