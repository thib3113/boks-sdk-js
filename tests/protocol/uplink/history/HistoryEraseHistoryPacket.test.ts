import { describe, it, expect } from 'vitest';
import { HistoryEraseHistoryPacket } from '@/protocol/uplink/history/HistoryEraseHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('HistoryEraseHistoryPacket', () => {
  it('should parse age correctly', () => {
    const packet = HistoryEraseHistoryPacket.fromPayload(hexToBytes('00003C'));
    expect(packet.age).toBe(60);
  });
});
