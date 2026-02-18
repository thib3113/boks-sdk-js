import { describe, it, expect } from 'vitest';
import { CountCodesPacket } from '@/protocol/downlink/CountCodesPacket';
import { bytesToHex } from '@/utils/converters';

describe('CountCodesPacket', () => {
  it('should generate correct binary for CountCodes (0x14)', () => {
    const packet = new CountCodesPacket();
    expect(bytesToHex(packet.encode())).toBe('140014');
  });
});



