import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { RebootPacket } from '@/protocol/downlink/RebootPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('RebootPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new RebootPacket();
    expect(packet.opcode).toBe(BoksOpcode.REBOOT);
    // 0x06 + 0x00 + Checksum(06)
    expect(bytesToHex(packet.encode())).toBe('060006');
  });

  it('should parse from payload correctly', () => {
    const packet = RebootPacket.fromRaw(new Uint8Array(0));
    expect(packet).toBeInstanceOf(RebootPacket);
    expect(packet.opcode).toBe(BoksOpcode.REBOOT);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new RebootPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 6,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([RebootPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
