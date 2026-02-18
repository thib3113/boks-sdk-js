import { describe, it, expect } from 'vitest';
import { PowerOffHistoryPacket } from '@/protocol/uplink/history/PowerOffHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('PowerOffHistoryPacket', () => {
  it('should parse age and reason correctly', () => {
    const packet = new PowerOffHistoryPacket();
    packet.parse(hexToBytes('00003C01'));
    expect(packet.age).toBe(60);
    expect(packet.reason).toBe(1);
  });
});



