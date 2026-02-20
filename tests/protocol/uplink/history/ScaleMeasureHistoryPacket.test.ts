import { describe, it, expect } from 'vitest';
import { ScaleMeasureHistoryPacket } from '@/protocol/uplink/history/ScaleMeasureHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('ScaleMeasureHistoryPacket', () => {
  it('should parse age, data and date correctly', () => {
    const age = 60;
    const now = Date.now();
    const payload = hexToBytes('00003CAABBCC'); // 60s, Data AABBCC
    const packet = ScaleMeasureHistoryPacket.fromPayload(payload);

    expect(packet.age).toBe(age);
    expect(bytesToHex(packet.data)).toBe('AABBCC');
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_SCALE_MEASURE);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
