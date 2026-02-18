import { describe, it, expect } from 'vitest';
import { DoorOpenHistoryPacket } from '@/protocol/uplink/history/DoorOpenHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('DoorOpenHistoryPacket', () => {
  it('should parse open event correctly', () => {
    const packet = new DoorOpenHistoryPacket();
    const hex = '910300003CD0';
    packet.parse(hexToBytes('00003C')); // 60s
    expect(packet.status).toBe('open');
    expect(packet.age).toBe(60);
    expect(bytesToHex(packet.encode())).toBe(hex);
  });
});



