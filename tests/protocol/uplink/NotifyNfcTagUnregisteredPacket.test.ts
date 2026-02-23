import { describe, it, expect } from 'vitest';
import { NotifyNfcTagUnregisteredPacket } from '@/protocol/uplink/NotifyNfcTagUnregisteredPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyNfcTagUnregisteredPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyNfcTagUnregisteredPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED);
  });
});
