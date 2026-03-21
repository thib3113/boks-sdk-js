import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { UnregisterNfcTagPacket } from '@/protocol/downlink/UnregisterNfcTagPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('UnregisterNfcTagPacket', () => {
  const validKey = '12345678';
  const validUid = '04:A1:B2:C3'; // 4 bytes -> 8 hex chars.

  it('should construct with valid parameters', () => {
    const packet = new UnregisterNfcTagPacket({ configKey: validKey, uid: validUid });
    expect(packet.opcode).toBe(BoksOpcode.UNREGISTER_NFC_TAG);
    expect(packet.configKey).toBe(validKey);
    expect(packet.uid).toBe('04A1B2C3');
  });

  it('should encode correctly', () => {
    const packet = new UnregisterNfcTagPacket({ configKey: validKey, uid: validUid });
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x19);
    expect(encoded[1]).toBe(13);

    // Key "12345678" -> 3132333435363738
    // Len: 04
    // UID: 04A1B2C3
    const expectedPayload = '31323334353637380404A1B2C3';
    expect(bytesToHex(encoded.subarray(2, 15))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new UnregisterNfcTagPacket({ configKey: '12345678', uid: '04A1B2C3' });
    // Same as register, but opcode is 0x19 instead of 0x18
    // Received: 190D31323334353637380404A1B2C3E8
    expect(bytesToHex(packet.encode())).toBe('190D31323334353637380404A1B2C3E8');
  });

  it('should parse from payload correctly', () => {
    const uidBytes = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const payload = new Uint8Array(8 + 1 + 4);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = 4;
    payload.set(uidBytes, 9);

    const packet = UnregisterNfcTagPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.uid).toBe('01020304');
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(() => new UnregisterNfcTagPacket({ configKey: 'invalid', uid: validUid })).toThrowError(
      BoksProtocolError
    );
  });

  it('should throw INVALID_NFC_UID_FORMAT for invalid uid', () => {
    expect(() => new UnregisterNfcTagPacket({ configKey: validKey, uid: '01:02:03' })).toThrowError(
      BoksProtocolError
    );
  });

  it('should fail parsing if payload is malformed', () => {
    const payload = new Uint8Array(8);
    payload.set(stringToBytes(validKey), 0);
    expect(() => UnregisterNfcTagPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new UnregisterNfcTagPacket({ configKey: '12345678', uid: '04A1B2C3' });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "opcode": 25,
        "uid": "04A1B2C3",
      });
  });
});
