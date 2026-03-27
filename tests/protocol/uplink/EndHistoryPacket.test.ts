import { describe, it, expect } from 'vitest';
import { EndHistoryPacket } from '@/protocol/uplink/EndHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('EndHistoryPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = EndHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_END_HISTORY);
  });
});
