import { describe, it, expect } from 'vitest';
import { CreateSingleUseCodePacket } from '@/protocol/downlink/CreateSingleUseCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('CreateSingleUseCodePacket', () => {
  it('should generate correct binary for CreateSingleUseCode (0x12)', () => {
    const packet = new CreateSingleUseCodePacket('AABBCCDD', '123456');
    expect(bytesToHex(packet.encode())).toBe('120E414142424343444431323334353669');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new CreateSingleUseCodePacket('AABBCCDD', '123')).toThrow('PIN must be exactly 6 characters');
  });
});



