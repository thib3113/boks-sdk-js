import { describe, it, expect } from 'vitest';
import { ValidOpenCodePacket } from '@/protocol/uplink/ValidOpenCodePacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ValidOpenCodePacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ValidOpenCodePacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.VALID_OPEN_CODE);
  });
});
