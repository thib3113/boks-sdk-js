import { describe, it, expect } from 'vitest';
import { PowerOnHistoryPacket } from '@/protocol/uplink/history/PowerOnHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('PowerOnHistoryPacket', () => {
  it('should parse age and date correctly', () => {
    const age = 10;
    const now = Date.now();
    const payload = hexToBytes('00000A'); // 10s
    const packet = PowerOnHistoryPacket.fromPayload(payload);

    expect(packet.age).toBe(age);
    expect(packet.opcode).toBe(BoksOpcode.POWER_ON);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
