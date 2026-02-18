import { describe, it, expect } from 'vitest';
import { DoorCloseHistoryPacket } from '@/protocol/uplink/history/DoorCloseHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('DoorCloseHistoryPacket', () => {
  it('should parse close event correctly', () => {
    const packet = new DoorCloseHistoryPacket();
    const hex = '900300000A9D';
    packet.parse(hexToBytes('00000A')); // 10s
    expect(packet.status).toBe('closed');
    expect(packet.age).toBe(10);
    expect(bytesToHex(packet.encode())).toBe(hex);
  });
});



