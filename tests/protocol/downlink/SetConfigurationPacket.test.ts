import { describe, it, expect } from 'vitest';
import { SetConfigurationPacket } from '@/protocol/downlink/SetConfigurationPacket';
import { bytesToHex } from '@/utils/converters';

describe('SetConfigurationPacket', () => {
  it('should generate correct binary for La Poste NFC activation (0x16)', () => {
    const packet = new SetConfigurationPacket('AABBCCDD', 0x01, true);
    expect(bytesToHex(packet.encode())).toBe('160A4141424243434444010136');
  });
});



