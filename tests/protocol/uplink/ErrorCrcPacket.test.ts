import { describe, it, expect } from 'vitest';
import { ErrorCrcPacket } from '@/protocol/uplink/ErrorCrcPacket';

describe('ErrorCrcPacket', () => {
  it('should parse correctly', () => {
    const packet = ErrorCrcPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(0xE0);
  });
});
