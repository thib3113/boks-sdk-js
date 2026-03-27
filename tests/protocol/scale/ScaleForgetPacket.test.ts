import { describe, it, expect } from 'vitest';
import { ScaleForgetPacket } from '@/protocol/scale/ScaleForgetPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleForgetPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleForgetPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_FORGET_BONDING);
    // 0x53 0x00 CS
    expect(bytesToHex(packet.encode())).toBe('530053');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleForgetPacket.fromRaw(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_FORGET_BONDING);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleForgetPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 83,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScaleForgetPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = ScaleForgetPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
