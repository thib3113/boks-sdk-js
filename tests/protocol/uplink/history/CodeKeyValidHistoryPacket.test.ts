import { describe, it, expect } from 'vitest';
import { CodeKeyValidHistoryPacket } from '@/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('CodeKeyValidHistoryPacket', () => {
  it('should parse age and code correctly', () => {
    const payload = hexToBytes('00003C313233344142');
    const packet = new CodeKeyValidHistoryPacket();
    packet.parse(payload);
    
    expect(packet.age).toBe(60);
    expect(packet.code).toBe('1234AB');
  });
});



