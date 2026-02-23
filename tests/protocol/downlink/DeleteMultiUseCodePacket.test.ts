import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { DeleteMultiUseCodePacket } from '@/protocol/downlink/DeleteMultiUseCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('DeleteMultiUseCodePacket', () => {
  it('should generate correct binary for DeleteMultiUseCode (0x0E)', () => {
    const packet = new DeleteMultiUseCodePacket('AABBCCDD', '123456');
    expect(bytesToHex(packet.encode())).toBe('0E0E414142424343444431323334353665');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new DeleteMultiUseCodePacket('AABBCCDD', 'INVALID')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
  });
});



