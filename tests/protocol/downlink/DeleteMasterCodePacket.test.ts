import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { DeleteMasterCodePacket } from '@/protocol/downlink/DeleteMasterCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('DeleteMasterCodePacket', () => {
  it('should generate correct binary for DeleteMasterCode (0x0C)', () => {
    const packet = new DeleteMasterCodePacket('AABBCCDD', 1);
    expect(bytesToHex(packet.encode())).toBe('0C094141424243434444012A');
  });
});



