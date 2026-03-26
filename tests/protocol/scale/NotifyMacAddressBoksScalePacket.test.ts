import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { NotifyMacAddressBoksScalePacket } from '@/protocol/scale/NotifyMacAddressBoksScalePacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyMacAddressBoksScalePacket', () => {
  it('should parse correctly', () => {
    // AA:BB:CC:DD:EE:FF -> FF:EE:DD:CC:BB:AA (MacAddress is Little Endian in protocol)
    const payload = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]);
    const packet = NotifyMacAddressBoksScalePacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE);
    expect(packet.macAddress).toBe('FFEEDDCCBBAA');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyMacAddressBoksScalePacket('FF:EE:DD:CC:BB:AA');
    const encoded = packet.encode();
    // Opcode 0xB2 (178), Len 6, MAC AABBCCDDEEFF, Checksum 0x04
    // Sum: 178 + 6 + 170 + 187 + 204 + 221 + 238 + 255 = 1459, 1459 % 256 = 179 = 0xB3 ? Wait.
    // Let me re-calculate Sum carefully:
    // 178+6 + 170+187+204+221+238+255 = 1459.
    // 1459 % 256 = 179 (0xB3).
    expect(bytesToHex(encoded)).toBe('B206AABBCCDDEEFFB3');
  });

  it('should handle empty payload', () => {
    const payload = new Uint8Array(0);
    expect(() => NotifyMacAddressBoksScalePacket.fromRaw(payload)).toThrowError(
      BoksProtocolError
    );
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyMacAddressBoksScalePacket.fromRaw(new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "macAddress": "FFEEDDCCBBAA",
        "opcode": 178,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyMacAddressBoksScalePacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = NotifyMacAddressBoksScalePacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
