import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { DeleteSingleUseCodePacket } from '@/protocol/downlink/DeleteSingleUseCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('DeleteSingleUseCodePacket', () => {
  const validKey = '12345678';
  const validPin = '998877';

  it('should construct with valid parameters', () => {
    const packet = new DeleteSingleUseCodePacket({ configKey: validKey, pin: validPin });
    expect(packet.opcode).toBe(BoksOpcode.DELETE_SINGLE_USE_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new DeleteSingleUseCodePacket({ configKey: validKey, pin: validPin });
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x0d);
    expect(encoded[1]).toBe(14);

    // Key "12345678" -> 3132333435363738
    // Pin "998877" -> 393938383737
    const expectedPayload = '3132333435363738393938383737';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = DeleteSingleUseCodePacket.fromRaw(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(
      () => new DeleteSingleUseCodePacket({ configKey: 'invalid', pin: validPin })
    ).toThrowError(BoksProtocolError);
    try {
      new DeleteSingleUseCodePacket({ configKey: 'invalid', pin: validPin });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
    }
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
    expect(() => new DeleteSingleUseCodePacket({ configKey: validKey, pin: '123' })).toThrowError(
      BoksProtocolError
    );
    expect(
      () => new DeleteSingleUseCodePacket({ configKey: validKey, pin: '12345C' })
    ).toThrowError(BoksProtocolError);

    try {
      new DeleteSingleUseCodePacket({ configKey: validKey, pin: '12345C' });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PIN_FORMAT);
    }
  });

  it('should fail parsing if payload is too short', () => {
    const shortPayload = new Uint8Array(10);
    expect(() => DeleteSingleUseCodePacket.fromRaw(shortPayload)).toThrowError(
      BoksProtocolError
    );
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new DeleteSingleUseCodePacket({ configKey: '12345678', pin: '998877' });
    // Opcode 0x0D, Len 14 (0x0E), Key '12345678', PIN '998877', Checksum 0x0F
    expect(bytesToHex(packet.encode())).toBe('0D0E31323334353637383939383837370F');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new DeleteSingleUseCodePacket({ configKey: validKey, pin: validPin });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "opcode": 13,
        "pin": "998877",
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([DeleteSingleUseCodePacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
