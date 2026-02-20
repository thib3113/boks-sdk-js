import { describe, it, expect } from 'vitest';
import { DoorOpenHistoryPacket } from '@/protocol/uplink/history/DoorOpenHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('DoorOpenHistoryPacket', () => {
  it('should parse open event correctly', () => {
    const hex = '910300003CD0';
    const packet = DoorOpenHistoryPacket.fromPayload(hexToBytes('00003C')); // 60s
    expect(packet.status).toBe('open');
    expect(packet.age).toBe(60);
    expect(Math.abs(packet.date.getTime() - (Date.now() - 60000))).toBeLessThan(1000);
    expect(bytesToHex(packet.encode())).toBe(hex);
  });
});
