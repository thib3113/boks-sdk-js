import { describe, it, expect } from 'vitest';
import { NotifyNfcTagFoundPacket } from '@/protocol/uplink/NotifyNfcTagFoundPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyNfcTagFoundPacket', () => {
  it('should parse correctly', () => {
    // 01 02 03 04 -> "01020304"
    const payload = new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]);
    const packet = NotifyNfcTagFoundPacket.fromRaw(buildMockRawPacket(NotifyNfcTagFoundPacket.opcode, payload));

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
    expect(packet.uid).toBe('01020304');
    expect(packet.status).toBe('found');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyNfcTagFoundPacket('11223344');
    const encoded = packet.encode();
    // Opcode 0xC5 (197), Len 5, 04, 11223344, Checksum 0xEF
    // 197+5+4+17+34+51+68 = 376, 376%256 = 120 = 0x78 ? Wait.
    // 197+5+4 + 0x11(17) + 0x22(34) + 0x33(51) + 0x44(68) = 376
    // 376 % 256 = 120 (0x78)
    expect(bytesToHex(encoded)).toBe('C505041122334478');
  });

  it('should parse 7-byte UID correctly', () => {
    // 01 02 03 04 05 06 07 -> "01020304050607"
    const payload = new Uint8Array([0x07, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
    const packet = NotifyNfcTagFoundPacket.fromRaw(buildMockRawPacket(NotifyNfcTagFoundPacket.opcode, payload));

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
    expect(packet.uid).toBe('01020304050607');
    expect(packet.status).toBe('found');
  });

  it('should parse 10-byte UID correctly', () => {
    // 01 02 03 04 05 06 07 08 09 0A -> "0102030405060708090A"
    const payload = new Uint8Array([
      0x0a, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a
    ]);
    const packet = NotifyNfcTagFoundPacket.fromRaw(buildMockRawPacket(NotifyNfcTagFoundPacket.opcode, payload));

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
    expect(packet.uid).toBe('0102030405060708090A');
    expect(packet.status).toBe('found');
  });

  it('should parse cleanly if UID length is greater than 10', () => {
    // We removed manual length validation from fromRaw, relying entirely on the payload mapper bounds checking
    const payload = new Uint8Array([
      0x0b, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b
    ]);
    const packet = NotifyNfcTagFoundPacket.fromRaw(buildMockRawPacket(NotifyNfcTagFoundPacket.opcode, payload));
    expect(packet.uid).toBe('0102030405060708090A0B');
  });

  it('should throw on empty payload', () => {
    const payload = new Uint8Array(0);
    expect(() => NotifyNfcTagFoundPacket.fromRaw(buildMockRawPacket(NotifyNfcTagFoundPacket.opcode, payload))).toThrow();
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyNfcTagFoundPacket.fromRaw(buildMockRawPacket(NotifyNfcTagFoundPacket.opcode, new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 197,
        "uid": "01020304",
      });
  });
});
