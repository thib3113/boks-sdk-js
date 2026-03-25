import { describe, it, expect } from 'vitest';
import { DoorOpenHistoryPacket } from '@/protocol/uplink/history/DoorOpenHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('DoorOpenHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    const packet = DoorOpenHistoryPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
    expect(packet.age).toBe(10);
    expect(packet.status).toBe('open');
  });

  it('should encode correctly', () => {
    const packet = new DoorOpenHistoryPacket({ age: 55 });
    const encoded = packet.encode();
    // 0x91 + 3 + 000037
    expect(encoded[0]).toBe(0x91);
    expect(encoded[1]).toBe(3);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('000037');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = DoorOpenHistoryPacket.fromRaw(new Uint8Array([0x00, 0x00, 0x0a]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "opcode": 145,
      });
  });
});
