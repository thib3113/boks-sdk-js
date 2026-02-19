import { describe, it, expect } from 'vitest';
import { ErrorHistoryPacket } from '@/protocol/uplink/history/ErrorHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('ErrorHistoryPacket', () => {
  it('should parse age and error code correctly', () => {
    const payload = hexToBytes('000005BC'); // 5s, error 0xBC
    const packet = ErrorHistoryPacket.fromPayload(payload);
    expect(packet.age).toBe(5);
    expect(packet.errorCode).toBe(0xBC);
  });
});
