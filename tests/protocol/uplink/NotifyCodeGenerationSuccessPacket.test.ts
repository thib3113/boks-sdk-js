import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationSuccessPacket } from '@/protocol/uplink/NotifyCodeGenerationSuccessPacket';

describe('NotifyCodeGenerationSuccessPacket', () => {
  it('should parse correctly', () => {
    const packet = NotifyCodeGenerationSuccessPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(0xC0);
  });
});
