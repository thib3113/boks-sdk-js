import { describe, it, expect } from 'vitest';
import { UnregisterNfcTagPacket } from '@/protocol/downlink/UnregisterNfcTagPacket';
import { bytesToHex } from '@/utils/converters';

describe('UnregisterNfcTagPacket', () => {
  it('should generate correct binary for UnregisterNfcTag (0x19)', () => {
    const packet = new UnregisterNfcTagPacket('AABBCCDD', "04:A1:B2:C3");
    // Sum: 25 + 13 + 532 + 4 + 4 + 161 + 178 + 195 = 1112 (0x458) -> 0x58
    expect(bytesToHex(packet.encode())).toBe('190D41414242434344440404A1B2C358');
  });
});



