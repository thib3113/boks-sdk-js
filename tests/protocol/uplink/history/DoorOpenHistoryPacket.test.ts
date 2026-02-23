import { describe, it, expect } from 'vitest';
import { DoorOpenHistoryPacket } from '@/protocol/uplink/history/DoorOpenHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('DoorOpenHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = DoorOpenHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
    expect(packet.age).toBe(0x010203);
    expect(packet.status).toBe('open');
  });
});
