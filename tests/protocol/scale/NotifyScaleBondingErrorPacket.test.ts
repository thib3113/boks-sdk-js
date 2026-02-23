import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingErrorPacket } from '@/protocol/scale/NotifyScaleBondingErrorPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleBondingErrorPacket', () => {
  it('should parse correctly with error code', () => {
    const payload = new Uint8Array([0x05]);
    const packet = NotifyScaleBondingErrorPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_ERROR);
    expect(packet.errorCode).toBe(5);
  });

  it('should handle missing error code (default 0)', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyScaleBondingErrorPacket.fromPayload(payload);
    expect(packet.errorCode).toBe(0);
  });
});
