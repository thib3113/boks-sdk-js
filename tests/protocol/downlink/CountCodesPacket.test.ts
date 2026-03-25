import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { CountCodesPacket } from '@/protocol/downlink/CountCodesPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CountCodesPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new CountCodesPacket();
    expect(packet.opcode).toBe(BoksOpcode.COUNT_CODES);
    expect(bytesToHex(packet.encode())).toBe('140014');
  });

  it('should parse from payload correctly', () => {
    const packet = CountCodesPacket.fromRaw(new Uint8Array(0));
    expect(packet).toBeInstanceOf(CountCodesPacket);
    expect(packet.opcode).toBe(BoksOpcode.COUNT_CODES);
  });

  it('should handle extra payload bytes gracefully (ignore them)', () => {
    const packet = CountCodesPacket.fromRaw(new Uint8Array([0xff]));
    expect(packet).toBeInstanceOf(CountCodesPacket);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new CountCodesPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 20,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([CountCodesPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
