import { describe, it, expect } from 'vitest';
import { NotifyScaleFaultyPacket } from '@/protocol/scale/NotifyScaleFaultyPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyScaleFaultyPacket', () => {
  it('should parse correctly with data', () => {
    const payload = new Uint8Array([0x01, 0x02]);
    const packet = NotifyScaleFaultyPacket.fromRaw(buildMockRawPacket(NotifyScaleFaultyPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_FAULTY);
    expect(packet.data).toEqual(payload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleFaultyPacket(new Uint8Array([0x01, 0x02]));
    const encoded = packet.encode();
    // Opcode 0xBA (186), Len 2, Data 0102, Checksum 0xBD (186+2+1+2=191=0xBF ? Wait)
    // 186 + 2 + 1 + 2 = 191 (0xBF)
    expect(bytesToHex(encoded)).toBe('BA020102BF');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleFaultyPacket.fromRaw(buildMockRawPacket(NotifyScaleFaultyPacket.opcode, new Uint8Array([0x01, 0x02])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "data": new Uint8Array([
          1,
          2,
        ]),
        "opcode": 186,
      });
  });
});
