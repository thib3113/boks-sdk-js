import { describe, it, expect } from 'vitest';
import { ErrorUnauthorizedPacket } from '@/protocol/uplink/ErrorUnauthorizedPacket';

describe('ErrorUnauthorizedPacket', () => {
  it('should parse correctly', () => {
    const packet = ErrorUnauthorizedPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(0xE1);
  });
});
