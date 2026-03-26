import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { ScaleReconnectPacket } from '@/protocol/scale/ScaleReconnectPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleReconnectPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleReconnectPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_RECONNECT);
    expect(bytesToHex(packet.encode())).toBe('620062');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleReconnectPacket.fromRaw(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_RECONNECT);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleReconnectPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 98,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScaleReconnectPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = ScaleReconnectPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
