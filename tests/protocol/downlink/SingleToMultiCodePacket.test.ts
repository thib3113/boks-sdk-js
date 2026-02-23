import { describe, it, expect } from 'vitest';
import { SingleToMultiCodePacket } from '@/protocol/downlink/SingleToMultiCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('SingleToMultiCodePacket', () => {
  const validKey = 'ABCDEF12';
  const validPin = '123456';

  it('should construct with valid parameters', () => {
    const packet = new SingleToMultiCodePacket(validKey, validPin);
    expect(packet.opcode).toBe(BoksOpcode.SINGLE_USE_CODE_TO_MULTI);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new SingleToMultiCodePacket(validKey, validPin);
    const encoded = packet.encode();
    // 0x0A + 14 + Key + Pin
    expect(encoded[0]).toBe(0x0A);
    expect(encoded[1]).toBe(14);

    // Key "ABCDEF12" -> 4142434445463132
    // Pin "123456" -> 313233343536
    const expectedPayload = '4142434445463132313233343536';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = SingleToMultiCodePacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new SingleToMultiCodePacket('invalid', validPin)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
      expect(() => new SingleToMultiCodePacket(validKey, '123')).toThrowError(BoksProtocolError);
  });

  it('should fail parsing if payload is too short', () => {
      const shortPayload = new Uint8Array(10);
      expect(() => SingleToMultiCodePacket.fromPayload(shortPayload)).toThrowError(BoksProtocolError);
  });
});
