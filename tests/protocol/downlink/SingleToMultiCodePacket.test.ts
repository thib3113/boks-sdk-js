import { describe, it, expect } from 'vitest';
import { SingleToMultiCodePacket } from '@/protocol/downlink/SingleToMultiCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('SingleToMultiCodePacket', () => {
  it('should generate correct binary for SingleToMulti (0x0A)', () => {
    const packet = new SingleToMultiCodePacket('AABBCCDD', '123456');
    expect(bytesToHex(packet.encode())).toBe('0A0E414142424343444431323334353661');
  });
});



