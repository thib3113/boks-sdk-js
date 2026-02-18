import { describe, it, expect } from 'vitest';
import { ScaleTareLoadedPacket } from '@/protocol/scale/ScaleTareLoadedPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleTareLoadedPacket', () => {
  it('should generate correct binary for ScaleTareLoaded (0x56)', () => {
    const packet = new ScaleTareLoadedPacket();
    expect(bytesToHex(packet.encode())).toBe('560056');
  });
});



