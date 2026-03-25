import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, expect, it } from 'vitest';
import { CodeKeyInvalidHistoryPacket } from '@/protocol/uplink/history/CodeKeyInvalidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CodeKeyInvalidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54]);
    const packet = CodeKeyInvalidHistoryPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_KEY_INVALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new CodeKeyInvalidHistoryPacket({ age: 200, code: '654321' });
    const encoded = packet.encode();
    // Opcode 0x89 (137), Len 9, Age 200 (0000C8), PIN 363534333231, Checksum 0xEC
    // Sum: 137 + 9 + 200 + (54+53+52+51+50+49) = 137 + 9 + 200 + 309 = 655, 655%256 = 143 = 0x8F ? Wait
    // Sum: 137 + 9 + 0 + 0 + 200 + 54 + 53 + 52 + 51 + 50 + 49 = 755?
    // Let's re-calculate Sum carefully:
    // 0x89(137) + 0x09(9) + 0x00(0) + 0x00(0) + 0xC8(200) + 0x36(54) + 0x35(53) + 0x34(52) + 0x33(51) + 0x32(50) + 0x31(49) = 705
    // 705 / 256 = 2, reste 193 (0xC1). Wait.
    // 137+9+200+54+53+52+51+50+49 = 705.
    // 705 % 256 = 193 = 0xC1.
    expect(bytesToHex(encoded)).toBe('89090000C83635343332318F');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = CodeKeyInvalidHistoryPacket.fromRaw(new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "code": "123456",
        "opcode": 137,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([CodeKeyInvalidHistoryPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
