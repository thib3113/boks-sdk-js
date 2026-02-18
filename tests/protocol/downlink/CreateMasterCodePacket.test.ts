import { describe, it, expect } from 'vitest';
import { CreateMasterCodePacket } from '@/protocol/downlink/CreateMasterCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('CreateMasterCodePacket', () => {
  it('should generate correct binary for CreateMasterCode (0x11)', () => {
    const packet = new CreateMasterCodePacket('AABBCCDD', 1, '123456');
    expect(bytesToHex(packet.encode())).toBe('110F4141424243434444313233343536016A');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new CreateMasterCodePacket('AABBCCDD', 1, '123')).toThrow('PIN must be exactly 6 characters');
  });
});



