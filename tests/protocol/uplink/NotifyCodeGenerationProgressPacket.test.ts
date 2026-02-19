import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationProgressPacket } from '@/protocol/uplink/NotifyCodeGenerationProgressPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyCodeGenerationProgressPacket', () => {
  it('should parse progress correctly', () => {
    const packet = NotifyCodeGenerationProgressPacket.fromPayload(hexToBytes('32')); // 50%
    expect(packet.progress).toBe(50);
  });
});
