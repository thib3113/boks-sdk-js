import { describe, it, expect } from 'vitest';
import { PowerOffHistoryPacket } from '@/protocol/uplink/history/PowerOffHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('PowerOffHistoryPacket', () => {
  it('should parse correctly with age and reason', () => {
    // 0x01 Reason
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01]);
    const packet = PowerOffHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.POWER_OFF);
    expect(packet.age).toBe(10);
    expect(packet.reason).toBe(1);
  });

  it('should handle missing reason', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0A]);
    const packet = PowerOffHistoryPacket.fromPayload(payload);
    expect(packet.reason).toBe(0);
  });
});
