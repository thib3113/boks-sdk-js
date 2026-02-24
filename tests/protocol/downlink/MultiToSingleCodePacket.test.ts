import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { MultiToSingleCodePacket } from '@/protocol/downlink/MultiToSingleCodePacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('MultiToSingleCodePacket', () => {
  const validKey = 'ABCDEF12';
  const validPin = '123456';

  it('should construct with valid parameters', () => {
    const packet = new MultiToSingleCodePacket(validKey, validPin);
    expect(packet.opcode).toBe(BoksOpcode.MULTI_CODE_TO_SINGLE_USE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new MultiToSingleCodePacket(validKey, validPin);
    const encoded = packet.encode();
    // 0x0B
    expect(encoded[0]).toBe(0x0B);
    expect(encoded[1]).toBe(14);

    const expectedPayload = '4142434445463132313233343536';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = MultiToSingleCodePacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new MultiToSingleCodePacket('invalid', validPin)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
      expect(() => new MultiToSingleCodePacket(validKey, '123')).toThrowError(BoksProtocolError);
  });

  it('should fail parsing if payload is too short', () => {
      const shortPayload = new Uint8Array(10);
      expect(() => MultiToSingleCodePacket.fromPayload(shortPayload)).toThrowError(BoksProtocolError);
  });
});
