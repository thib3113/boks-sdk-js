import { describe, it, expect } from 'vitest';
import { NotifyNfcTagUnregisteredPacket } from '@/protocol/uplink/NotifyNfcTagUnregisteredPacket';

describe('NotifyNfcTagUnregisteredPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyNfcTagUnregisteredPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xCA);
  });
});



