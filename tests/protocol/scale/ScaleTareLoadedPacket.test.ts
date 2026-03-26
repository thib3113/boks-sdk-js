import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { ScaleTareLoadedPacket } from '@/protocol/scale/ScaleTareLoadedPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleTareLoadedPacket', () => {
  it('should construct and encode correctly with data', () => {
    const data = new Uint8Array([0x01, 0x02]);
    const packet = new ScaleTareLoadedPacket(data);
    expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_LOADED);

    // Opcode 56, Len 2, Data 0102
    expect(bytesToHex(packet.encode())).toBe('560201025B');
  });

  it('should parse from payload correctly', () => {
    const data = new Uint8Array([0x01, 0x02]);
    const packet = ScaleTareLoadedPacket.fromRaw(data);
    expect(packet.data).toEqual(data);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = ScaleTareLoadedPacket.fromRaw(new Uint8Array([0x01, 0x02]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 86,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScaleTareLoadedPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
