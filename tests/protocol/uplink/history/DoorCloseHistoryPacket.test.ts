import { describe, it, expect } from 'vitest';
import { DoorCloseHistoryPacket } from '@/protocol/uplink/history/DoorCloseHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('DoorCloseHistoryPacket', () => {
  it('should parse close event correctly', () => {
    const age = 10;
    const now = Date.now();
    const hex = '900300000A9D';
    const packet = DoorCloseHistoryPacket.fromPayload(hexToBytes('00000A')); // 10s

    expect(packet.status).toBe('closed');
    expect(packet.age).toBe(age);
    expect(packet.opcode).toBe(BoksOpcode.LOG_DOOR_CLOSE);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);

    expect(bytesToHex(packet.encode())).toBe(hex);
  });
});
