import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { MultiToSingleCodePacket } from '@/protocol/downlink/MultiToSingleCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('MultiToSingleCodePacket', () => {
  it('should generate correct binary for MultiToSingle (0x0B)', () => {
    const packet = new MultiToSingleCodePacket('AABBCCDD', '123456');
    expect(bytesToHex(packet.encode())).toBe('0B0E414142424343444431323334353662');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new MultiToSingleCodePacket('AABBCCDD', '123')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
  });
});



