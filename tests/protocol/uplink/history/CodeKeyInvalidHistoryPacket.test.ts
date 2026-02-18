import { describe, it, expect } from 'vitest';
import { CodeKeyInvalidHistoryPacket } from '@/protocol/uplink/history/CodeKeyInvalidHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('CodeKeyInvalidHistoryPacket', () => {
  it('should parse age and code correctly', () => {
    const payload = hexToBytes('00003C313233344142');
    const packet = new CodeKeyInvalidHistoryPacket();
    packet.parse(payload);
    
    expect(packet.age).toBe(60);
    expect(packet.code).toBe('1234AB');
  });
});



