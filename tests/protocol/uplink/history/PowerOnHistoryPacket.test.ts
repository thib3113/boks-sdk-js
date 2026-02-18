import { describe, it, expect } from 'vitest';
import { PowerOnHistoryPacket } from '@/protocol/uplink/history/PowerOnHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('PowerOnHistoryPacket', () => {
  it('should parse age correctly', () => {
    const payload = hexToBytes('00000A'); // 10s
    const packet = new PowerOnHistoryPacket();
    packet.parse(payload);
    expect(packet.age).toBe(10);
  });
});



