import { describe, it, expect } from 'vitest';
import { NfcRegisteringHistoryPacket } from '@/protocol/uplink/history/NfcRegisteringHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NfcRegisteringHistoryPacket', () => {
  it('should parse correctly with age and data', () => {
    // 0x01, 0x02, 0x03, 0x04 -> Data
    const payload = new Uint8Array([0x00, 0x00, 0x0a, 0x01, 0x02, 0x03, 0x04]);
    const packet = NfcRegisteringHistoryPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_REGISTERING);
    expect(packet.age).toBe(10);
    expect(packet.data).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NfcRegisteringHistoryPacket({
      age: 10,
      data: new Uint8Array([0x01, 0x02, 0x03, 0x04])
    });
    const encoded = packet.encode();
    // Opcode 0xA2 (162), Len 7, Age 10 (00000A), Data 01020304, Checksum 0xBA
    // Sum: 162 + 7 + 10 + 1 + 2 + 3 + 4 = 189 (0xBD) - Wait, let me re-calculate Sum carefully:
    // 162 + 7 + 0 + 0 + 10 + 1 + 2 + 3 + 4 = 186 (0xBA)
    expect(bytesToHex(encoded)).toBe('A20700000A01020304BD');
  });

  it('should handle missing data', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    const packet = NfcRegisteringHistoryPacket.fromRaw(payload);
    expect(packet.data.length).toBe(0);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NfcRegisteringHistoryPacket.fromRaw(new Uint8Array([0x00, 0x00, 0x0a, 0x01, 0x02, 0x03, 0x04]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "data": new Uint8Array([
          1,
          2,
          3,
          4,
        ]),
        "opcode": 162,
      "validChecksum": null,

      });
  });
});
