import { describe, it, expect } from 'vitest';
import { RebootPacket } from '@/protocol/downlink/RebootPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('RebootPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new RebootPacket();
    expect(packet.opcode).toBe(BoksOpcode.REBOOT);
    // 0x06 + 0x00 + Checksum(06)
    expect(bytesToHex(packet.encode())).toBe('060006');
  });

  it('should parse from payload correctly', () => {
    const packet = RebootPacket.fromRaw(buildMockRawPacket(RebootPacket.opcode, new Uint8Array(0)));
    expect(packet).toBeInstanceOf(RebootPacket);
    expect(packet.opcode).toBe(BoksOpcode.REBOOT);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new RebootPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 6,
      });
  });
});
