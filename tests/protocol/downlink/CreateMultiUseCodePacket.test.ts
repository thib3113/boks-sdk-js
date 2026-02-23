import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { CreateMultiUseCodePacket } from '@/protocol/downlink/CreateMultiUseCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('CreateMultiUseCodePacket', () => {
  it('should generate correct binary for CreateMultiUseCode (0x13)', () => {
    const packet = new CreateMultiUseCodePacket('AABBCCDD', '123456');
    expect(bytesToHex(packet.encode())).toBe('130E41414242434344443132333435366A');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new CreateMultiUseCodePacket('AABBCCDD', '123')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
  });
});



