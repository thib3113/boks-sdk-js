import { describe, it, expect } from 'vitest';
import { KeyOpeningHistoryPacket } from '@/protocol/uplink/history/KeyOpeningHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('KeyOpeningHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = KeyOpeningHistoryPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_KEY_OPENING);
    expect(packet.age).toBe(0x010203);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new KeyOpeningHistoryPacket({ age: 1000 });
    // Opcode 0x99, Len 3, Age 1000 (0003E8), Checksum 0x87 (153+3+3+232=391, 391%256=135=0x87)
    expect(bytesToHex(packet.encode())).toBe('99030003E887');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = KeyOpeningHistoryPacket.fromRaw(new Uint8Array([0x01, 0x02, 0x03]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({ validChecksum: null,
        "age": 66051,
        "opcode": 153,
      });
  });
});
