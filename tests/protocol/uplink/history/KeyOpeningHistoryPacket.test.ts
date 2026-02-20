import { describe, it, expect } from 'vitest';
import { KeyOpeningHistoryPacket } from '@/protocol/uplink/history/KeyOpeningHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('KeyOpeningHistoryPacket', () => {
  it('should parse age and date correctly', () => {
    const age = 60;
    const now = Date.now();
    const packet = KeyOpeningHistoryPacket.fromPayload(hexToBytes('00003C'));

    expect(packet.age).toBe(age);
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_KEY_OPENING);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
