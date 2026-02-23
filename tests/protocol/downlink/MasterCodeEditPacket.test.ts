import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { MasterCodeEditPacket } from '@/protocol/downlink/MasterCodeEditPacket';
import { bytesToHex } from '@/utils/converters';

describe('MasterCodeEditPacket', () => {
  it('should generate correct binary for MasterCodeEdit (0x09)', () => {
    const packet = new MasterCodeEditPacket('AABBCCDD', 2, '654321');
    expect(bytesToHex(packet.encode())).toBe('090F41414242434344440236353433323163');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new MasterCodeEditPacket('AABBCCDD', 2, 'INVALID')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
  });

  it('should throw error for invalid index', () => {
    expect(() => new MasterCodeEditPacket('AABBCCDD', -1, '123456')).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    expect(() => new MasterCodeEditPacket('AABBCCDD', 256, '123456')).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    expect(() => new MasterCodeEditPacket('AABBCCDD', 1.5, '123456')).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
  });
});
