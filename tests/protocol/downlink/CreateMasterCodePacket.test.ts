import { describe, it, expect } from 'vitest';
import { CreateMasterCodePacket } from '@/protocol/downlink/CreateMasterCodePacket';
import { bytesToHex } from '@/utils/converters';

describe('CreateMasterCodePacket', () => {
  it('should generate correct binary for CreateMasterCode (0x11)', () => {
    const packet = new CreateMasterCodePacket('AABBCCDD', 1, '1234');
    expect(bytesToHex(packet.encode())).toBe('110F414142424343444431323334000001FF');
  });
});



