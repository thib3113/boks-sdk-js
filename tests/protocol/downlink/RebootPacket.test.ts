import { describe, it, expect } from 'vitest';
import { RebootPacket } from '@/protocol/downlink/RebootPacket';
import { bytesToHex } from '@/utils/converters';

describe('RebootPacket', () => {
  it('should generate correct binary for Reboot (0x06)', () => {
    const packet = new RebootPacket();
    expect(bytesToHex(packet.encode())).toBe('060006');
  });
});



