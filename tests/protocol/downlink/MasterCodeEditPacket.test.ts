import { describe, it, expect } from 'vitest';
import { MasterCodeEditPacket } from '@/protocol/downlink/MasterCodeEditPacket';
import { bytesToHex } from '@/utils/converters';

describe('MasterCodeEditPacket', () => {
  it('should generate correct binary for MasterCodeEdit (0x09)', () => {
    const packet = new MasterCodeEditPacket('AABBCCDD', 2, '654321');
    expect(bytesToHex(packet.encode())).toBe('090F41414242434344440236353433323163');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new MasterCodeEditPacket('AABBCCDD', 2, 'INVALID')).toThrow('PIN must be exactly 6 characters');
  });
});



