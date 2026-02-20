import { describe, it, expect } from 'vitest';
import { PowerOffHistoryPacket } from '@/protocol/uplink/history/PowerOffHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('PowerOffHistoryPacket', () => {
  it('should parse age, reason and date correctly', () => {
    const age = 60;
    const now = Date.now();
    const payload = hexToBytes('00003C01'); // 60s, reason 1
    const packet = PowerOffHistoryPacket.fromPayload(payload);

    expect(packet.age).toBe(age);
    expect(packet.reason).toBe(1);
    expect(packet.opcode).toBe(BoksOpcode.POWER_OFF);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
