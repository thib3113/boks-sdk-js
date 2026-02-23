import { describe, it, expect } from 'vitest';
import { InvalidOpenCodePacket } from '@/protocol/uplink/InvalidOpenCodePacket';
import { BoksOpcode } from '@/protocol/constants';

describe('InvalidOpenCodePacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = InvalidOpenCodePacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.INVALID_OPEN_CODE);
  });
});
