import { describe, it, expect } from 'vitest';
import { GenerateCodesSupportPacket } from '@/protocol/downlink/GenerateCodesSupportPacket';
import { bytesToHex } from '@/utils/converters';

describe('GenerateCodesSupportPacket', () => {
  it('should generate correct binary for GenerateCodesSupport (0x15)', () => {
    const seed = new Uint8Array(32).fill(0xEE);
    const packet = new GenerateCodesSupportPacket(seed);
    expect(bytesToHex(packet.encode())).toBe('1520EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEF5');
  });
});



