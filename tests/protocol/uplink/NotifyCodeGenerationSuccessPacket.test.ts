import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationSuccessPacket } from '@/protocol/uplink/NotifyCodeGenerationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyCodeGenerationSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyCodeGenerationSuccessPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS);
  });
});
