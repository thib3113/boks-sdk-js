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
    const packet = ScaleTareEmptyPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_EMPTY);
  });
});
