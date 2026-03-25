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
    const packet = ScaleForgetPacket.fromRaw(buildMockRawPacket(ScaleForgetPacket.opcode, new Uint8Array(0)));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_FORGET_BONDING);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleForgetPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 83,
      });
  });
});
