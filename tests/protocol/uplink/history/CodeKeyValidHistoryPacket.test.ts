import { describe, it, expect } from 'vitest';
import { CodeKeyValidHistoryPacket } from '@/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('CodeKeyValidHistoryPacket', () => {
  it('should parse age, date and code correctly', () => {
    const age = 60;
    const now = Date.now();
    const payload = hexToBytes('00003C313233344142'); // 60s, "1234AB"
    const packet = CodeKeyValidHistoryPacket.fromPayload(payload);
    
    expect(packet.age).toBe(age);
    expect(packet.code).toBe('1234AB');
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_KEY_VALID);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
