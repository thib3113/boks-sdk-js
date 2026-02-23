import { describe, it, expect } from 'vitest';
import { ErrorCrcPacket } from '@/protocol/uplink/ErrorCrcPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorCrcPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ErrorCrcPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.ERROR_CRC);
  });
});
