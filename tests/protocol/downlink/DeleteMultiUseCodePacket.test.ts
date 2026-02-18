import { describe, it, expect } from 'vitest';
import { DeleteMultiUseCodePacket } from '@/protocol/downlink/DeleteMultiUseCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('DeleteMultiUseCodePacket', () => {
  it('should generate correct binary for DeleteMultiUseCode (0x0E)', () => {
    const packet = new DeleteMultiUseCodePacket('AABBCCDD', '123456');
    // Sum: 0E + 0E + 532 + 309 = 869 (0x365) -> 0x65 (Expected: 0xFA in React tests??)
    // Wait, let's recalculate carefully.
    // React test says: 0E 0E 41 41 42 42 43 43 44 44 31 32 33 34 00 00 FA
    // 14 + 14 + 532 (Key) + 202 (Code "1234\0\0") = 762 -> 0x2FA -> 0xFA
    // In my test I use "123456" (6 bytes)
    // Sum: 14 + 14 + 532 + 309 ("123456") = 869 -> 0x365 -> 0x65
    expect(bytesToHex(packet.encode())).toBe('0E0E414142424343444431323334353665');
  });
});



