import { describe, it, expect } from 'vitest';
import { CreateMultiUseCodePacket } from '@/protocol/downlink/CreateMultiUseCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('CreateMultiUseCodePacket', () => {
  const validKey = '12345678';
  const validPin = '654321';

  it('should construct with valid parameters', () => {
    const packet = new CreateMultiUseCodePacket({ configKey: validKey, pin: validPin });
    expect(packet.opcode).toBe(BoksOpcode.CREATE_MULTI_USE_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new CreateMultiUseCodePacket({ configKey: validKey, pin: validPin });
    const encoded = packet.encode();
    // 0x13 + len(14) + key(8) + pin(6) + checksum
    expect(encoded[0]).toBe(0x13);
    expect(encoded[1]).toBe(14);

    // Key "12345678" -> 3132333435363738
    // Pin "654321" -> 363534333231
    const expectedPayload = '3132333435363738363534333231';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new CreateMultiUseCodePacket({ configKey: '12345678', pin: '654321' });
    const encoded = packet.encode();
    // Opcode 0x13, Len 14 (0x0E), Key '12345678', PIN '654321', Checksum 0xFE
    expect(bytesToHex(encoded)).toBe('130E3132333435363738363534333231FA');
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = CreateMultiUseCodePacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(
      () => new CreateMultiUseCodePacket({ configKey: 'invalid', pin: validPin })
    ).toThrowError(BoksProtocolError);
    try {
      new CreateMultiUseCodePacket({ configKey: 'invalid', pin: validPin });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
    }
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
    expect(() => new CreateMultiUseCodePacket({ configKey: validKey, pin: '123' })).toThrowError(
      BoksProtocolError
    );
    expect(() => new CreateMultiUseCodePacket({ configKey: validKey, pin: '12345C' })).toThrowError(
      BoksProtocolError
    );

    try {
      new CreateMultiUseCodePacket({ configKey: validKey, pin: '12345C' });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PIN_FORMAT);
    }
  });

  it('should fail parsing if payload is too short', () => {
    // Short payload leads to short pin or key extraction, which constructor validates.
    const shortPayload = new Uint8Array(10);
    expect(() => CreateMultiUseCodePacket.fromPayload(shortPayload)).toThrowError(
      BoksProtocolError
    );
  });
});
