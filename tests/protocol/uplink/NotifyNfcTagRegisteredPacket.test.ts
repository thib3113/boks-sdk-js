import { describe, it, expect } from 'vitest';
import { NotifyNfcTagRegisteredPacket } from '@/protocol/uplink/NotifyNfcTagRegisteredPacket';

describe('NotifyNfcTagRegisteredPacket', () => {
  it('should parse correctly', () => {
    const packet = NotifyNfcTagRegisteredPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(0xC8);
  });
});
