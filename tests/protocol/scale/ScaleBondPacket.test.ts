import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { ScaleBondPacket } from '@/protocol/scale/ScaleBondPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleBondPacket', () => {
  it('should construct and encode correctly', () => {
    // 0x01, 0x02, 0x03
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = new ScaleBondPacket(data);
    expect(packet.opcode).toBe(BoksOpcode.SCALE_BOND);

    // Opcode 50. Len 3. Payload 010203.
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x50);
    expect(encoded[1]).toBe(3);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('010203');
  });

  it('should parse from payload correctly', () => {
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = ScaleBondPacket.fromRaw(data);
    expect(packet.data).toEqual(data);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = ScaleBondPacket.fromRaw(new Uint8Array([0x01, 0x02, 0x03]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 80,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScaleBondPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
