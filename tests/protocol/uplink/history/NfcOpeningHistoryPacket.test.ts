import { describe, expect, it } from 'vitest';
import { NfcOpeningHistoryPacket } from '@/protocol/uplink/history/NfcOpeningHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

describe('NfcOpeningHistoryPacket', () => {
  it('should parse correctly with age, type and uid', () => {
    // UID 01020304
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01, 0x04, 0x01, 0x02, 0x03, 0x04, 0, 0, 0]);
    const packet = NfcOpeningHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_OPENING);
    expect(packet.age).toBe(10);
    expect(packet.tagType).toBe(1);
    expect(packet.uid).toBe('01020304');
  });

  it('should throw on missing uid due to strict parsing via mapper', () => {
    const payload = new Uint8Array([0, 0, 10, 1, 4]);
    // The mapper throws first due to out of bounds
    expect(() => NfcOpeningHistoryPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
  });

  it('should throw if payload length is shorter than expected UID length', () => {
    // We bypass the initial PayloadMapper to test the internal packet logic explicitly
    // Since PayloadMapper checks fixed size (5+7=12 bytes), we provide 12 bytes but specify a uidLen that exceeds it or we make sure to hit the custom logic.
    // Wait, if PayloadMapper requires exactly 12 bytes because of @PayloadByteArray(5, 7),
    // it will parse successfully if we provide exactly 12 bytes.
    // What if uidLength = 8?
    // The mapper will set uidLength to 8.
    // Then the custom logic checks: if (payload.length (12) < offset (5) + uidLen (8) = 13)
    // It should throw the custom error!

    const payload = new Uint8Array([0, 0, 10, 1, 8, 1, 2, 3, 4, 5, 6, 7]); // 12 bytes length
    // uidLength is at index 4, which is 8.

    expect(() => NfcOpeningHistoryPacket.fromPayload(payload)).toThrowError('Payload too short for UID length 8');
  });

  it('should handle constructor with default parameters', () => {
    const packet = new NfcOpeningHistoryPacket();
    expect(packet.age).toBe(0);
    expect(packet.tagType).toBe(0);
    expect(packet.uid).toBe('');
  });
});
