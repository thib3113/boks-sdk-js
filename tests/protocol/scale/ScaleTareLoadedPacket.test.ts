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
    const packet = ScaleTareLoadedPacket.fromPayload(data);
    expect(packet.data).toEqual(data);
  });
});
