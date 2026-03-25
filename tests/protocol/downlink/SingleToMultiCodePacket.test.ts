import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { SingleToMultiCodePacket } from '@/protocol/downlink/SingleToMultiCodePacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('SingleToMultiCodePacket', () => {
  const validKey = '12345678';
  const validPin = '876543';

  it('should construct with valid parameters', () => {
    const packet = new SingleToMultiCodePacket({ configKey: validKey, pin: validPin });
    expect(packet.opcode).toBe(BoksOpcode.SINGLE_USE_CODE_TO_MULTI);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new SingleToMultiCodePacket({ configKey: validKey, pin: validPin });
    const encoded = packet.encode();
    // 0x0A + 14 + Key + Pin
    expect(encoded[0]).toBe(0x0a);
    expect(encoded[1]).toBe(14);

    // Key "12345678" -> 3132333435363738
    // Pin "876543" -> 383736353433
    const expectedPayload = '3132333435363738383736353433';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new SingleToMultiCodePacket({ configKey: '12345678', pin: '876543' });
    // Received: 0A0E3132333435363738383736353433FD
    expect(bytesToHex(packet.encode())).toBe('0A0E3132333435363738383736353433FD');
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = SingleToMultiCodePacket.fromRaw(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(() => new SingleToMultiCodePacket({ configKey: 'invalid', pin: validPin })).toThrowError(
      BoksProtocolError
    );
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
    expect(() => new SingleToMultiCodePacket({ configKey: validKey, pin: '123' })).toThrowError(
      BoksProtocolError
    );
  });

  it('should fail parsing if payload is too short', () => {
    const shortPayload = new Uint8Array(10);
    expect(() => SingleToMultiCodePacket.fromRaw(shortPayload)).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new SingleToMultiCodePacket({ configKey: validKey, pin: validPin });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "opcode": 10,
        "pin": "876543",
      "validChecksum": null,

      });
  });
});
