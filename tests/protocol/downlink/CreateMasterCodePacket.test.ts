import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { CreateMasterCodePacket } from '@/protocol/downlink/CreateMasterCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('CreateMasterCodePacket', () => {
  it('should generate correct binary for CreateMasterCode (0x11)', () => {
    const packet = new CreateMasterCodePacket('AABBCCDD', 1, '123456');
    expect(bytesToHex(packet.encode())).toBe('110F4141424243434444313233343536016A');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new CreateMasterCodePacket('AABBCCDD', 1, '123')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
  });

  it('should throw error for invalid index', () => {
    expect(() => new CreateMasterCodePacket('AABBCCDD', -1, '123456')).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    expect(() => new CreateMasterCodePacket('AABBCCDD', 256, '123456')).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    expect(() => new CreateMasterCodePacket('AABBCCDD', 1.5, '123456')).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
  });
});
