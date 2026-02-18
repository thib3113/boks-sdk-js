import { describe, it, expect } from 'vitest';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from '@/protocol/uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';

describe('NotifyNfcTagRegisteredErrorAlreadyExistsPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyNfcTagRegisteredErrorAlreadyExistsPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xC9);
  });
});



