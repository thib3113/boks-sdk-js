import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { RegisterNfcTagScanStartPacket } from '@/protocol/downlink/RegisterNfcTagScanStartPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('RegisterNfcTagScanStartPacket', () => {
  const validKey = '12345678';

  it('should construct with valid parameters', () => {
    const packet = new RegisterNfcTagScanStartPacket(validKey);
    expect(packet.opcode).toBe(BoksOpcode.REGISTER_NFC_TAG_SCAN_START);
    expect(packet.configKey).toBe(validKey);
  });

  it('should encode correctly', () => {
    const packet = new RegisterNfcTagScanStartPacket(validKey);
    const encoded = packet.encode();
    // 0x17 + 9 + 0x00 + Key
    expect(encoded[0]).toBe(0x17);
    expect(encoded[1]).toBe(9);

    // Key "12345678" -> 3132333435363738
    const expectedPayload = '003132333435363738';
    expect(bytesToHex(encoded.subarray(2, 11))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new RegisterNfcTagScanStartPacket('12345678');
    const encoded = packet.encode();
    // Opcode 0x17, Len 9, Payload 00 + '12345678' (3132333435363738), Checksum 0xC4
    expect(bytesToHex(encoded)).toBe('1709003132333435363738C4');
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array([0, ...stringToBytes(validKey)]);
    const packet = RegisterNfcTagScanStartPacket.fromRaw(payload);
    expect(packet.configKey).toBe(validKey);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(() => new RegisterNfcTagScanStartPacket('invalid')).toThrowError(
      BoksProtocolError
    );
    expect(() => new RegisterNfcTagScanStartPacket('')).toThrowError(
      BoksProtocolError
    );
  });

  it('should fail parsing if payload is too short (bad key)', () => {
    const payload = new Uint8Array(5);
    expect(() => RegisterNfcTagScanStartPacket.fromRaw(payload)).toThrowError(
      BoksProtocolError
    );
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new RegisterNfcTagScanStartPacket(validKey);
    const json = packet.toJSON();
    expect(json).toStrictEqual({ validChecksum: null,
        "configKey": "12345678",
        "opcode": 23,
      });
  });
});
