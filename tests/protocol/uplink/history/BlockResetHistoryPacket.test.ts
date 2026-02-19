import { describe, it, expect } from 'vitest';
import { BlockResetHistoryPacket } from '@/protocol/uplink/history/BlockResetHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('BlockResetHistoryPacket', () => {
  it('should parse age correctly', () => {
    const packet = BlockResetHistoryPacket.fromPayload(hexToBytes('00003C'));
    expect(packet.age).toBe(60);
  });
});
