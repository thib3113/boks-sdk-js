import { describe, it, expect } from 'vitest';
import { ScaleBondPacket } from '@/protocol/scale/ScaleBondPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleBondPacket', () => {
  it('should generate correct binary for ScaleBond (0x50)', () => {
    const packet = new ScaleBondPacket();
    expect(bytesToHex(packet.encode())).toBe('500050');
  });
});



