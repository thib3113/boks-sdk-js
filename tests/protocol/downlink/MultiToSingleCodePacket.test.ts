import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { MultiToSingleCodePacket } from '@/protocol/downlink/MultiToSingleCodePacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('MultiToSingleCodePacket', () => {
  const validKey = '12345678';
  const validPin = '876543';

  it('should construct with valid parameters', () => {
    const packet = new MultiToSingleCodePacket({ configKey: validKey, pin: validPin });
    expect(packet.opcode).toBe(BoksOpcode.MULTI_CODE_TO_SINGLE_USE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new MultiToSingleCodePacket({ configKey: validKey, pin: validPin });
    const encoded = packet.encode();
    // 0x0B
    expect(encoded[0]).toBe(0x0b);
    expect(encoded[1]).toBe(14);

    // Key "12345678" -> 3132333435363738
    // Pin "876543" -> 383736353433
    const expectedPayload = '3132333435363738383736353433';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new MultiToSingleCodePacket({ configKey: '12345678', pin: '876543' });
    // Received: 0B0E3132333435363738383736353433FE
    expect(bytesToHex(packet.encode())).toBe('0B0E3132333435363738383736353433FE');
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = MultiToSingleCodePacket.fromRaw(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(() => new MultiToSingleCodePacket({ configKey: 'invalid', pin: validPin })).toThrowError(
      BoksProtocolError
    );
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
    expect(() => new MultiToSingleCodePacket({ configKey: validKey, pin: '123' })).toThrowError(
      BoksProtocolError
    );
  });

  it('should fail parsing if payload is too short', () => {
    const shortPayload = new Uint8Array(10);
    expect(() => MultiToSingleCodePacket.fromRaw(shortPayload)).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new MultiToSingleCodePacket({ configKey: validKey, pin: validPin });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "opcode": 11,
        "pin": "876543",
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([MultiToSingleCodePacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
