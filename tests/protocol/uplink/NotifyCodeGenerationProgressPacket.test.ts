import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationProgressPacket } from '@/protocol/uplink/NotifyCodeGenerationProgressPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyCodeGenerationProgressPacket', () => {
  it('should parse correctly', () => {
    // 50%
    const payload = new Uint8Array([50]);
    const packet = NotifyCodeGenerationProgressPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS);
    expect(packet.progress).toBe(50);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyCodeGenerationProgressPacket(50);
    const encoded = packet.encode();
    // Opcode 0xC2 (194), Len 1, Progress 50 (0x32), Checksum 0xF5 (194+1+50=245=0xF5)
    expect(bytesToHex(encoded)).toBe('C20132F5');
  });
});
