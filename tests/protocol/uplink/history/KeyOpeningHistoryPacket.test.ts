import { describe, it, expect } from 'vitest';
import { KeyOpeningHistoryPacket } from '@/protocol/uplink/history/KeyOpeningHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('KeyOpeningHistoryPacket', () => {
  it('should parse age correctly', () => {
    const packet = new KeyOpeningHistoryPacket();
    packet.parse(hexToBytes('00003C'));
    expect(packet.age).toBe(60);
  });
});



