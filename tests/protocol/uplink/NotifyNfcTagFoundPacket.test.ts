import { describe, it, expect } from 'vitest';
import { NotifyNfcTagFoundPacket } from '@/protocol/uplink/NotifyNfcTagFoundPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyNfcTagFoundPacket', () => {
  it('should parse correctly', () => {
    // 01 02 03 04 -> "01020304"
    const payload = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const packet = NotifyNfcTagFoundPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
    expect(packet.uid).toBe('01020304');
    expect(packet.status).toBe('found');
  });

  it('should handle empty payload (empty uid)', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
    expect(packet.uid).toBe('');
  });
});
