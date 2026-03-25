import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { ScaleGetMacPacket } from '@/protocol/scale/ScaleGetMacPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleGetMacPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleGetMacPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
    expect(bytesToHex(packet.encode())).toBe('520052');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleGetMacPacket.fromRaw(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleGetMacPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 82,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScaleGetMacPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
