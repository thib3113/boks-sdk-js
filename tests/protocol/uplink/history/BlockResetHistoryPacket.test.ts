import { describe, it, expect } from 'vitest';
import { BlockResetHistoryPacket } from '@/protocol/uplink/history/BlockResetHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('BlockResetHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = BlockResetHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.BLOCK_RESET);
    expect(packet.age).toBe(0x010203);
  });


  describe('BlockResetHistoryPacket default construction', () => {
    it('should handle constructor with default age', () => {
      const packet = new BlockResetHistoryPacket(0);
      expect(packet.age).toBe(0);
    });
  });
});
