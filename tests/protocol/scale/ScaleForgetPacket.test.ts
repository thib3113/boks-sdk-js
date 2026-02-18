import { describe, it, expect } from 'vitest';
import { ScaleForgetPacket } from '@/protocol/scale/ScaleForgetPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleForgetPacket', () => {
  it('should generate correct binary for ScaleForget (0x53)', () => {
    const packet = new ScaleForgetPacket();
    expect(bytesToHex(packet.encode())).toBe('530053');
  });
});



