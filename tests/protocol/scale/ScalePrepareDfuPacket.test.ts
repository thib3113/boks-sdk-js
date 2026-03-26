import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { ScalePrepareDfuPacket } from '@/protocol/scale/ScalePrepareDfuPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScalePrepareDfuPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScalePrepareDfuPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_PREPARE_DFU);
    expect(bytesToHex(packet.encode())).toBe('600060');
  });

  it('should parse from payload correctly', () => {
    const packet = ScalePrepareDfuPacket.fromRaw(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_PREPARE_DFU);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScalePrepareDfuPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 96,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScalePrepareDfuPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
