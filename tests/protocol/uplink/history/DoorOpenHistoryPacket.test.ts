import { describe, it, expect } from 'vitest';
import { DoorOpenHistoryPacket } from '@/protocol/uplink/history/DoorOpenHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('DoorOpenHistoryPacket', () => {
  it('should parse open event correctly', () => {
    const age = 60;
    const now = Date.now();
    const hex = '910300003CD0';
    const packet = DoorOpenHistoryPacket.fromPayload(hexToBytes('00003C')); // 60s

    expect(packet.status).toBe('open');
    expect(packet.age).toBe(age);
    expect(packet.opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);

    expect(bytesToHex(packet.encode())).toBe(hex);
  });
});
