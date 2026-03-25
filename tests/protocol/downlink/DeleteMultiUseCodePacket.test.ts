import { describe, it, expect } from 'vitest';
import { DeleteMultiUseCodePacket } from '@/protocol/downlink/DeleteMultiUseCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('DeleteMultiUseCodePacket', () => {
  const validKey = '12345678';
  const validPin = '334455';

  it('should construct with valid parameters', () => {
    const packet = new DeleteMultiUseCodePacket({ configKey: validKey, pin: validPin });
    expect(packet.opcode).toBe(BoksOpcode.DELETE_MULTI_USE_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new DeleteMultiUseCodePacket({ configKey: validKey, pin: validPin });
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x0e);
    expect(encoded[1]).toBe(14);

    // Key "12345678" -> 3132333435363738
    // Pin "334455" -> 333334343535
    const expectedPayload = '3132333435363738333334343535';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = DeleteMultiUseCodePacket.fromRaw(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(
      () => new DeleteMultiUseCodePacket({ configKey: 'invalid', pin: validPin })
    ).toThrowError(BoksProtocolError);
    try {
      new DeleteMultiUseCodePacket({ configKey: 'invalid', pin: validPin });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
    }
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
    expect(() => new DeleteMultiUseCodePacket({ configKey: validKey, pin: '123' })).toThrowError(
      BoksProtocolError
    );
    expect(() => new DeleteMultiUseCodePacket({ configKey: validKey, pin: '12345C' })).toThrowError(
      BoksProtocolError
    );

    try {
      new DeleteMultiUseCodePacket({ configKey: validKey, pin: '12345C' });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PIN_FORMAT);
    }
  });

  it('should fail parsing if payload is too short', () => {
    const shortPayload = new Uint8Array(10);
    expect(() => DeleteMultiUseCodePacket.fromRaw(shortPayload)).toThrowError(
      BoksProtocolError
    );
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new DeleteMultiUseCodePacket({ configKey: '12345678', pin: '334455' });
    // Opcode 0x0E, Len 14 (0x0E), Key '12345678', PIN '334455', Checksum 0xF8
    expect(bytesToHex(packet.encode())).toBe('0E0E3132333435363738333334343535F8');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new DeleteMultiUseCodePacket({ configKey: validKey, pin: validPin });
    const json = packet.toJSON();
    expect(json).toStrictEqual({ validChecksum: null,
        "configKey": "12345678",
        "opcode": 14,
        "pin": "334455",
      });
  });
});
