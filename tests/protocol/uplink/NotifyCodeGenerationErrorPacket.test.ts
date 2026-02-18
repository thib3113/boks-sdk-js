import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationErrorPacket } from '@/protocol/uplink/NotifyCodeGenerationErrorPacket';

describe('NotifyCodeGenerationErrorPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyCodeGenerationErrorPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xC1);
  });
});



