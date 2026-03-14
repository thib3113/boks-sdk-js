import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingProgressPacket } from '@/protocol/scale/NotifyScaleBondingProgressPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleBondingProgressPacket', () => {
  it('should parse correctly with progress', () => {
    const payload = new Uint8Array([50]);
    const packet = NotifyScaleBondingProgressPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS);
    expect(packet.progress).toBe(50);
  });

  it('should throw error on missing progress', () => {
    const payload = new Uint8Array(0);
    expect(() => NotifyScaleBondingProgressPacket.fromPayload(payload)).toThrowError();
  });
});
