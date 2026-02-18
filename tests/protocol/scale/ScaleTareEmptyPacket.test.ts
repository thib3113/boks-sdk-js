import { describe, it, expect } from 'vitest';
import { ScaleTareEmptyPacket } from '@/protocol/scale/ScaleTareEmptyPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleTareEmptyPacket', () => {
  it('should generate correct binary for ScaleTareEmpty (0x55)', () => {
    const packet = new ScaleTareEmptyPacket();
    expect(bytesToHex(packet.encode())).toBe('550055');
  });
});



