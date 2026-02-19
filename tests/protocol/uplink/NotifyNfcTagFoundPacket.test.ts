import { describe, it, expect } from 'vitest';
import { NotifyNfcTagFoundPacket } from '@/protocol/uplink/NotifyNfcTagFoundPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyNfcTagFoundPacket', () => {
  it('should parse found status', () => {
    const packet = NotifyNfcTagFoundPacket.fromPayload(hexToBytes('04A1B2C3'));
    expect(packet.status).toBe('found');
    expect(packet.uid).toBe('04A1B2C3');
  });
});
