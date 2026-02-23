import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationErrorPacket } from '@/protocol/uplink/NotifyCodeGenerationErrorPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyCodeGenerationErrorPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyCodeGenerationErrorPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODE_GENERATION_ERROR);
  });
});
