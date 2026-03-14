import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationProgressPacket } from '@/protocol/uplink/NotifyCodeGenerationProgressPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyCodeGenerationProgressPacket', () => {
  it('should parse correctly', () => {
    // 50%
    const payload = new Uint8Array([50]);
    const packet = NotifyCodeGenerationProgressPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS);
    expect(packet.progress).toBe(50);
  });

  it('should throw MALFORMED_DATA on short payload', () => {
    const payload = new Uint8Array(0);
    expect(() => NotifyCodeGenerationProgressPacket.fromPayload(payload)).toThrowError();
  });
});
