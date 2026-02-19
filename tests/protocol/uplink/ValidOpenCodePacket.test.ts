import { describe, it, expect } from 'vitest';
import { ValidOpenCodePacket } from '@/protocol';

describe('ValidOpenCodePacket', () => {
  it('should parse correctly', () => {
    const packet = ValidOpenCodePacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(0x81);
  });
});
