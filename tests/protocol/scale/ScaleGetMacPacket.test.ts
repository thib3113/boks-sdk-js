import { describe, it, expect } from 'vitest';
import { ScaleGetMacPacket } from '@/protocol/scale/ScaleGetMacPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleGetMacPacket', () => {
  it('should generate correct binary for ScaleGetMac (0x52)', () => {
    const packet = new ScaleGetMacPacket();
    expect(bytesToHex(packet.encode())).toBe('520052');
  });
});



