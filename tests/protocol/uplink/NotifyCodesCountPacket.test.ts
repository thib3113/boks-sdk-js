import { describe, it, expect } from 'vitest';
import { NotifyCodesCountPacket } from '@/protocol/uplink/NotifyCodesCountPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyCodesCountPacket', () => {
  it('should parse correctly', () => {
    // 0x000A (10) master, 0x0014 (20) other
    const payload = new Uint8Array([0x00, 0x0A, 0x00, 0x14]);
    const packet = NotifyCodesCountPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODES_COUNT);
    expect(packet.masterCount).toBe(10);
    expect(packet.otherCount).toBe(20);
  });

  it('should handle short payload gracefully (defaults to 0)', () => {
    const payload = new Uint8Array(2);
    const packet = NotifyCodesCountPacket.fromPayload(payload);
    expect(packet.masterCount).toBe(0);
    expect(packet.otherCount).toBe(0);
  });
});
