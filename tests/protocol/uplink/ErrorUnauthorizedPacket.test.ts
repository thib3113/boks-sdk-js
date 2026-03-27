import { describe, it, expect } from 'vitest';
import { ErrorUnauthorizedPacket } from '@/protocol/uplink/ErrorUnauthorizedPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorUnauthorizedPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ErrorUnauthorizedPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.ERROR_UNAUTHORIZED);
  });
});
