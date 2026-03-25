import { describe, it, expect } from 'vitest';
import { ErrorCrcPacket } from '@/protocol/uplink/ErrorCrcPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('ErrorCrcPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ErrorCrcPacket.fromRaw(buildMockRawPacket(ErrorCrcPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.ERROR_CRC);
  });
});
