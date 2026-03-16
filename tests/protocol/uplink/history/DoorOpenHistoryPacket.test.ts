import { describe, it, expect } from 'vitest';
import { DoorOpenHistoryPacket } from '@/protocol/uplink/history/DoorOpenHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('DoorOpenHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0A]);
    const packet = DoorOpenHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
    expect(packet.age).toBe(10);
    expect(packet.status).toBe('open');
  });

  it('should encode correctly', () => {
    const packet = new DoorOpenHistoryPacket({ age: 10 }, new Uint8Array([0x00, 0x00, 0x0A]));
    const payload = packet.toPayload();

    expect(payload).toEqual(new Uint8Array([0x00, 0x00, 0x0A]));
  });
});
