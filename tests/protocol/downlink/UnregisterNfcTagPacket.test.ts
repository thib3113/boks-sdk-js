import { describe, it, expect } from 'vitest';
import { UnregisterNfcTagPacket } from '@/protocol/downlink/UnregisterNfcTagPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('UnregisterNfcTagPacket', () => {
  const validKey = '12345678';
  const validUid = '01:02:03:04'; // 4 bytes -> 8 hex chars.

  it('should construct with valid parameters', () => {
    const packet = new UnregisterNfcTagPacket(validKey, validUid);
    expect(packet.opcode).toBe(BoksOpcode.UNREGISTER_NFC_TAG);
    expect(packet.configKey).toBe(validKey);
    expect(packet.uid).toBe(validUid);
  });

  it('should encode correctly', () => {
    const packet = new UnregisterNfcTagPacket(validKey, validUid);
    const encoded = packet.encode();
    // 0x19 + 13 + Key + Len + UID
    expect(encoded[0]).toBe(0x19);
    expect(encoded[1]).toBe(13);

    // Key "12345678" -> 3132333435363738
    // Len: 04
    // UID: 01020304
    const expectedPayload = '31323334353637380401020304';
    expect(bytesToHex(encoded.subarray(2, 15))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const uidBytes = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const payload = new Uint8Array(8 + 1 + 4);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = 4;
    payload.set(uidBytes, 9);

    const packet = UnregisterNfcTagPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.uid).toBe(validUid);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new UnregisterNfcTagPacket('invalid', validUid)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_NFC_UID_FORMAT for invalid uid', () => {
      expect(() => new UnregisterNfcTagPacket(validKey, '01:02:03')).toThrowError(BoksProtocolError);
  });

  it('should fail parsing if payload is malformed', () => {
      const payload = new Uint8Array(8);
      payload.set(stringToBytes(validKey), 0);
      expect(() => UnregisterNfcTagPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
  });
});
