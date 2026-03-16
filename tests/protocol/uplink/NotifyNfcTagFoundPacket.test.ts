import { describe, it, expect } from 'vitest';
import { NotifyNfcTagFoundPacket } from '@/protocol/uplink/NotifyNfcTagFoundPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyNfcTagFoundPacket', () => {
  it('should parse correctly', () => {
    // 01 02 03 04 -> "01020304"
    const payload = new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]);
    const packet = NotifyNfcTagFoundPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
    expect(packet.uid).toBe('01020304');
    expect(packet.status).toBe('found');
  });

  it('should parse 7-byte UID correctly', () => {
    // 01 02 03 04 05 06 07 -> "01020304050607"
    const payload = new Uint8Array([0x07, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
    const packet = NotifyNfcTagFoundPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
    expect(packet.uid).toBe('01020304050607');
    expect(packet.status).toBe('found');
  });

  it('should parse 10-byte UID correctly', () => {
    // 01 02 03 04 05 06 07 08 09 0A -> "0102030405060708090A"
    const payload = new Uint8Array([
      0x0A, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A
    ]);
    const packet = NotifyNfcTagFoundPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
    expect(packet.uid).toBe('0102030405060708090A');
    expect(packet.status).toBe('found');
  });

  it('should parse cleanly if UID length is greater than 10', () => {
    // We removed manual length validation from fromPayload, relying entirely on the payload mapper bounds checking
    const payload = new Uint8Array([
      0x0B, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B
    ]);
    const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
    expect(packet.uid).toBe('0102030405060708090A0B');
  });

  it('should throw on empty payload', () => {
    const payload = new Uint8Array(0);
    expect(() => NotifyNfcTagFoundPacket.fromPayload(payload)).toThrow();
  });
});
