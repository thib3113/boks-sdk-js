import { describe, it, expect } from 'vitest';
import { DoorCloseHistoryPacket } from '@/protocol/uplink/history/DoorCloseHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('DoorCloseHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = DoorCloseHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_DOOR_CLOSE);
    expect(packet.age).toBe(0x010203);
    expect(packet.status).toBe('closed');
  });
});
