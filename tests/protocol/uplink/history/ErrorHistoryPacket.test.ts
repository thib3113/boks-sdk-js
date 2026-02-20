import { describe, it, expect } from 'vitest';
import { ErrorHistoryPacket } from '@/protocol/uplink/history/ErrorHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorHistoryPacket', () => {
  it('should parse age, error code and date correctly', () => {
    const age = 5;
    const now = Date.now();
    const payload = hexToBytes('000005BC'); // 5s, error 0xBC
    const packet = ErrorHistoryPacket.fromPayload(payload);

    expect(packet.age).toBe(age);
    expect(packet.errorCode).toBe(0xBC);
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_ERROR);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
