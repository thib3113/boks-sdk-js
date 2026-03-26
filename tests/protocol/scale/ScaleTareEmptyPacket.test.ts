import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { ScaleTareEmptyPacket } from '@/protocol/scale/ScaleTareEmptyPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleTareEmptyPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleTareEmptyPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_EMPTY);
    expect(bytesToHex(packet.encode())).toBe('550055');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleTareEmptyPacket.fromRaw(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_EMPTY);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleTareEmptyPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 85,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScaleTareEmptyPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
