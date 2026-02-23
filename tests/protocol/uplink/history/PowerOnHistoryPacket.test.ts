import { describe, it, expect } from 'vitest';
import { PowerOnHistoryPacket } from '@/protocol/uplink/history/PowerOnHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('PowerOnHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = PowerOnHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.POWER_ON);
    expect(packet.age).toBe(0x010203);
  });
});
