import { describe, it, expect } from 'vitest';
import { MultiToSingleCodePacket } from '@/protocol/downlink/MultiToSingleCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('MultiToSingleCodePacket', () => {
  it('should generate correct binary for MultiToSingle (0x0B)', () => {
    const packet = new MultiToSingleCodePacket('AABBCCDD', '123456');
    expect(bytesToHex(packet.encode())).toBe('0B0E414142424343444431323334353662');
  });
});



