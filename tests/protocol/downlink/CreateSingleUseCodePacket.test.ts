import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { CreateSingleUseCodePacket } from '@/protocol/downlink/CreateSingleUseCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('CreateSingleUseCodePacket', () => {
  const validKey = '12345678';
  const validPin = '112233';

  it('should construct with valid parameters', () => {
    const packet = new CreateSingleUseCodePacket({ configKey: validKey, pin: validPin });
    expect(packet.opcode).toBe(BoksOpcode.CREATE_SINGLE_USE_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new CreateSingleUseCodePacket({ configKey: validKey, pin: validPin });
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x12);
    expect(encoded[1]).toBe(14);

    // Key "12345678" -> 3132333435363738
    // Pin "112233" -> 313132323333
    const expectedPayload = '3132333435363738313132323333';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new CreateSingleUseCodePacket({ configKey: '12345678', pin: '112233' });
    const encoded = packet.encode();
    // Opcode 0x12, Len 14 (0x0E), Key '12345678', PIN '112233', Checksum 0xDE
    expect(bytesToHex(encoded)).toBe('120E3132333435363738313132323333F0');
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = CreateSingleUseCodePacket.fromRaw(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(
      () => new CreateSingleUseCodePacket({ configKey: 'invalid', pin: validPin })
    ).toThrowError(BoksProtocolError);
    try {
      new CreateSingleUseCodePacket({ configKey: 'invalid', pin: validPin });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
    }
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
    expect(() => new CreateSingleUseCodePacket({ configKey: validKey, pin: '123' })).toThrowError(
      BoksProtocolError
    );
    expect(
      () => new CreateSingleUseCodePacket({ configKey: validKey, pin: '12345C' })
    ).toThrowError(BoksProtocolError);

    try {
      new CreateSingleUseCodePacket({ configKey: validKey, pin: '12345C' });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PIN_FORMAT);
    }
  });

  it('should fail parsing if payload is too short', () => {
    const shortPayload = new Uint8Array(10);
    expect(() => CreateSingleUseCodePacket.fromRaw(shortPayload)).toThrowError(
      BoksProtocolError
    );
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new CreateSingleUseCodePacket({ configKey: validKey, pin: validPin });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "opcode": 18,
        "pin": "112233",
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([CreateSingleUseCodePacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
