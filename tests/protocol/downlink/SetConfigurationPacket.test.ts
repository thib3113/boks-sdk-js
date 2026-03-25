import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
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
    const packet = new SetConfigurationPacket({
      configKey: validKey,
      configType: type,
      value: valueTrue
    });
    expect(packet.opcode).toBe(BoksOpcode.SET_CONFIGURATION);
    expect(packet.configKey).toBe(validKey);
    expect(packet.configType).toBe(type);
    expect(packet.value).toBe(true);
  });

  it('should encode correctly', () => {
    const packet = new SetConfigurationPacket({
      configKey: validKey,
      configType: type,
      value: valueTrue
    });
    const encoded = packet.encode();
    // 0x16 + 10 + Key + Type + Value
    expect(encoded[0]).toBe(0x16);
    expect(encoded[1]).toBe(10);

    // Key "12345678" -> 3132333435363738
    // Type 01, Value 01 (true)
    const expectedPayload = '31323334353637380101';
    expect(bytesToHex(encoded.subarray(2, 12))).toBe(expectedPayload);

    const packet2 = new SetConfigurationPacket({
      configKey: validKey,
      configType: type,
      value: valueFalse
    });
    const encoded2 = packet2.encode();
    expect(encoded2[11]).toBe(0x00);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new SetConfigurationPacket({
      configKey: '12345678',
      configType: 1,
      value: true
    });
    const encoded = packet.encode();
    // Opcode 0x16, Len 10 (0x0A), Key '12345678', Type 1, Value 1, Checksum 0xC6
    expect(bytesToHex(encoded)).toBe('160A31323334353637380101C6');
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(10);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = type;
    payload[9] = 0x01;

    const packet = SetConfigurationPacket.fromRaw(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.configType).toBe(type);
    expect(packet.value).toBe(true);

    payload[9] = 0x00;
    const packet2 = SetConfigurationPacket.fromRaw(payload);
    expect(packet2.value).toBe(false);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(
      () => new SetConfigurationPacket({ configKey: 'invalid', configType: type, value: valueTrue })
    ).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_PAYLOAD_LENGTH if payload is wrong size', () => {
    const shortPayload = new Uint8Array(9);
    expect(() => SetConfigurationPacket.fromRaw(shortPayload)).toThrowError(BoksProtocolError);
    try {
      SetConfigurationPacket.fromRaw(shortPayload);
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH);
    }

    const longPayload = new Uint8Array(11);
    expect(() => SetConfigurationPacket.fromRaw(longPayload)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_VALUE if value byte is invalid', () => {
    const payload = new Uint8Array(10);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = type;
    payload[9] = 0x02; // Invalid boolean

    expect(() => SetConfigurationPacket.fromRaw(payload)).toThrowError(BoksProtocolError);
    try {
      SetConfigurationPacket.fromRaw(payload);
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_VALUE);
    }
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new SetConfigurationPacket({
      configKey: validKey,
      configType: type,
      value: valueTrue
    });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "configType": 1,
        "opcode": 22,
        "value": true,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([SetConfigurationPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
