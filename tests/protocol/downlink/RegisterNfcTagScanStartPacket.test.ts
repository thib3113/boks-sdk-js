import { describe, it, expect } from 'vitest';
import { RegisterNfcTagScanStartPacket } from '@/protocol/downlink/RegisterNfcTagScanStartPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
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
    // 0x17 + 8 + Key
    expect(encoded[0]).toBe(0x17);
    expect(encoded[1]).toBe(8);

    // Key "12345678" -> 3132333435363738
    const expectedPayload = '3132333435363738';
    expect(bytesToHex(encoded.subarray(2, 10))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = stringToBytes(validKey);
    const packet = RegisterNfcTagScanStartPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new RegisterNfcTagScanStartPacket('invalid')).toThrowError(BoksProtocolError);
     expect(() => new RegisterNfcTagScanStartPacket('')).toThrowError(BoksProtocolError);
  });

  it('should fail parsing if payload is too short (bad key)', () => {
      const payload = new Uint8Array(5);
      expect(() => RegisterNfcTagScanStartPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
  });
});
