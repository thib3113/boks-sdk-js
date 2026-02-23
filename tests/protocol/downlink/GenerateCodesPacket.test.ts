import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { GenerateCodesPacket } from '@/protocol/downlink/GenerateCodesPacket';
import { bytesToHex } from '@/utils/converters';

describe('GenerateCodesPacket', () => {
  it('should generate correct binary for GenerateCodes (0x10)', () => {
    const seed = new Uint8Array(32).fill(0xEE);
    const packet = new GenerateCodesPacket(seed);
    expect(bytesToHex(packet.encode())).toBe('1020EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEF0');
  });
});



