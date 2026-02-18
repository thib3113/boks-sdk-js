import { describe, it, expect } from 'vitest';
import { CreateSingleUseCodePacket } from '@/protocol/downlink/CreateSingleUseCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('CreateSingleUseCodePacket', () => {
  it('should generate correct binary for CreateSingleUseCode (0x12)', () => {
    const packet = new CreateSingleUseCodePacket('AABBCCDD', '1234');
    expect(bytesToHex(packet.encode())).toBe('120E4141424243434444313233340000FE');
  });
});



