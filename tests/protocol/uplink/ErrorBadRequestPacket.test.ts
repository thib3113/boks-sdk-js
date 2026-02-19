import { describe, it, expect } from 'vitest';
import { ErrorBadRequestPacket } from '@/protocol/uplink/ErrorBadRequestPacket';

describe('ErrorBadRequestPacket', () => {
  it('should parse correctly', () => {
    const packet = ErrorBadRequestPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(0xE2);
  });
});
