import { describe, it, expect } from 'vitest';
import { ErrorBadRequestPacket } from '@/protocol/uplink/ErrorBadRequestPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorBadRequestPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ErrorBadRequestPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.ERROR_BAD_REQUEST);
  });
});
