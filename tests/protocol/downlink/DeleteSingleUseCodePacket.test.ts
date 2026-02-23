import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { DeleteSingleUseCodePacket } from '@/protocol/downlink/DeleteSingleUseCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('DeleteSingleUseCodePacket', () => {
  it('should generate correct binary for DeleteSingleUseCode (0x0D)', () => {
    const packet = new DeleteSingleUseCodePacket('AABBCCDD', '123456');
    // Sum: 0D (13) + 0E (14) + 532 (Key) + 309 ("123456") = 868 (0x364) -> 0x64
    expect(bytesToHex(packet.encode())).toBe('0D0E414142424343444431323334353664');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new DeleteSingleUseCodePacket('AABBCCDD', 'INVALID')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
  });
});



