import { describe, it, expect } from 'vitest';
import { CreateMultiUseCodePacket } from '@/protocol/downlink/CreateMultiUseCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('CreateMultiUseCodePacket', () => {
  it('should generate correct binary for CreateMultiUseCode (0x13)', () => {
    const packet = new CreateMultiUseCodePacket('AABBCCDD', '1234');
    expect(bytesToHex(packet.encode())).toBe('130E4141424243434444313233340000FF');
  });
});



