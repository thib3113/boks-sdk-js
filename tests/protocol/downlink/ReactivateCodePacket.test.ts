import { describe, it, expect } from 'vitest';
import { ReactivateCodePacket } from '@/protocol/downlink/ReactivateCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('ReactivateCodePacket', () => {
  it('should generate correct binary for ReactivateCode (0x0F)', () => {
    const packet = new ReactivateCodePacket('AABBCCDD', '123456');
    expect(bytesToHex(packet.encode())).toBe('0F0E414142424343444431323334353666');
  });
});



