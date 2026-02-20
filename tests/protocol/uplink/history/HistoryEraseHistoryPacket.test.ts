import { describe, it, expect } from 'vitest';
import { HistoryEraseHistoryPacket } from '@/protocol/uplink/history/HistoryEraseHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('HistoryEraseHistoryPacket', () => {
  it('should parse age and date correctly', () => {
    const age = 60;
    const now = Date.now();
    const packet = HistoryEraseHistoryPacket.fromPayload(hexToBytes('00003C'));

    expect(packet.age).toBe(age);
    expect(packet.opcode).toBe(BoksOpcode.LOG_HISTORY_ERASE);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
