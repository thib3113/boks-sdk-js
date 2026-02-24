import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { NfcRegisterPacket } from '@/protocol/downlink/NfcRegisterPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('NfcRegisterPacket', () => {
  const validKey = '12345678';
  const validUid = '01:02:03:04'; // 4 bytes -> 8 hex chars. Minimum allowed.

  it('should construct with valid parameters', () => {
    const packet = new NfcRegisterPacket(validKey, validUid);
    expect(packet.opcode).toBe(BoksOpcode.REGISTER_NFC_TAG);
    expect(packet.configKey).toBe(validKey);
    expect(packet.uid).toBe(validUid);
  });

  it('should construct with unformatted UID (no colons)', () => {
      // The constructor calls validateNfcUid, which strips colons for regex check, but doesn't modify this.uid.
      // However, toPayload strips colons.
      const unformatted = '01020304';
      const packet = new NfcRegisterPacket(validKey, unformatted);
      expect(packet.uid).toBe(unformatted);
  });

  it('should encode correctly', () => {
    const packet = new NfcRegisterPacket(validKey, validUid);
    const encoded = packet.encode();
    // Opcode 0x18.
    // Key: 3132333435363738 (8 bytes)
    // Len: 04
    // UID: 01020304
    // Total Payload: 8 + 1 + 4 = 13 bytes.
    expect(encoded[0]).toBe(0x18);
    expect(encoded[1]).toBe(13);

    // Payload: 3132333435363738 04 01020304
    const expectedPayload = '31323334353637380401020304';
    expect(bytesToHex(encoded.subarray(2, 15))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const uidBytes = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const payload = new Uint8Array(8 + 1 + 4);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = 4;
    payload.set(uidBytes, 9);

    const packet = NfcRegisterPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.uid).toBe(validUid); // formatted with colons by fromPayload logic
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new NfcRegisterPacket('invalid', validUid)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_NFC_UID_FORMAT for invalid uid', () => {
      // Too short (< 8 chars / 4 bytes)
      expect(() => new NfcRegisterPacket(validKey, '01:02:03')).toThrowError(BoksProtocolError);
      // Too long (> 20 chars / 10 bytes)
      expect(() => new NfcRegisterPacket(validKey, '0102030405060708090A0B')).toThrowError(BoksProtocolError);
      // Not hex
      expect(() => new NfcRegisterPacket(validKey, 'ZZZZZZZZ')).toThrowError(BoksProtocolError);
  });

  it('should fail parsing if payload is malformed (short/invalid length byte)', () => {
      const payload = new Uint8Array(8); // Only key
      payload.set(stringToBytes(validKey), 0);

      // fromPayload logic: if length > 8 ... else uid = ''.
      // Constructor calls validateNfcUid(''). Empty string is too short -> Error.
      expect(() => NfcRegisterPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
  });
});
