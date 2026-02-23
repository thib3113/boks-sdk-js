import { describe, it, expect } from 'vitest';
import { HistoryEraseHistoryPacket } from '@/protocol/uplink/history/HistoryEraseHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('HistoryEraseHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = HistoryEraseHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_HISTORY_ERASE);
    expect(packet.age).toBe(0x010203);
  });
});
