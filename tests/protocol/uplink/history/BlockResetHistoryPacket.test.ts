import { describe, it, expect } from 'vitest';
import { BlockResetHistoryPacket } from '@/protocol/uplink/history/BlockResetHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('BlockResetHistoryPacket', () => {
  it('should parse age and date correctly', () => {
    const age = 60;
    const now = Date.now();
    const packet = BlockResetHistoryPacket.fromPayload(hexToBytes('00003C'));

    expect(packet.age).toBe(age);
    expect(packet.opcode).toBe(BoksOpcode.BLOCK_RESET);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
