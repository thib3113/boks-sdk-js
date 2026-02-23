import { describe, it, expect } from 'vitest';
import { SetConfigurationPacket } from '@/protocol/downlink/SetConfigurationPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('SetConfigurationPacket', () => {
  const validKey = '12345678';
  const type = 1;
  const valueTrue = true;
  const valueFalse = false;

  it('should construct with valid parameters', () => {
    const packet = new SetConfigurationPacket(validKey, type, valueTrue);
    expect(packet.opcode).toBe(BoksOpcode.SET_CONFIGURATION);
    expect(packet.configKey).toBe(validKey);
    expect(packet.configType).toBe(type);
    expect(packet.value).toBe(true);
  });

  it('should encode correctly', () => {
    const packet = new SetConfigurationPacket(validKey, type, valueTrue);
    const encoded = packet.encode();
    // 0x16 + 10 + Key + Type + Value
    expect(encoded[0]).toBe(0x16);
    expect(encoded[1]).toBe(10);

    // Key "12345678" -> 3132333435363738
    // Type 01, Value 01 (true)
    const expectedPayload = '31323334353637380101';
    expect(bytesToHex(encoded.subarray(2, 12))).toBe(expectedPayload);

    const packet2 = new SetConfigurationPacket(validKey, type, valueFalse);
    const encoded2 = packet2.encode();
    expect(encoded2[11]).toBe(0x00);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(10);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = type;
    payload[9] = 0x01;

    const packet = SetConfigurationPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.configType).toBe(type);
    expect(packet.value).toBe(true);

    payload[9] = 0x00;
    const packet2 = SetConfigurationPacket.fromPayload(payload);
    expect(packet2.value).toBe(false);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new SetConfigurationPacket('invalid', type, valueTrue)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_PAYLOAD_LENGTH if payload is wrong size', () => {
      const shortPayload = new Uint8Array(9);
      expect(() => SetConfigurationPacket.fromPayload(shortPayload)).toThrowError(BoksProtocolError);
      try {
        SetConfigurationPacket.fromPayload(shortPayload);
      } catch (e) {
         expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH);
      }

      const longPayload = new Uint8Array(11);
      expect(() => SetConfigurationPacket.fromPayload(longPayload)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_VALUE if value byte is invalid', () => {
      const payload = new Uint8Array(10);
      payload.set(stringToBytes(validKey), 0);
      payload[8] = type;
      payload[9] = 0x02; // Invalid boolean

      expect(() => SetConfigurationPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
      try {
        SetConfigurationPacket.fromPayload(payload);
      } catch (e) {
         expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_VALUE);
      }
  });
});
