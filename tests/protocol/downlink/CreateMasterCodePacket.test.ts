import { describe, it, expect } from 'vitest';
import { CreateMasterCodePacket } from '@/protocol/downlink/CreateMasterCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('CreateMasterCodePacket', () => {
  const validKey = '12345678';
  const validPin = '123456';
  const validIndex = 1;

  it('should construct with valid parameters', () => {
    const packet = new CreateMasterCodePacket({
      configKey: validKey,
      index: validIndex,
      pin: validPin
    });
    expect(packet.opcode).toBe(BoksOpcode.CREATE_MASTER_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(validIndex);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    // Key: 3132333435363738 (12345678)
    // Pin: 313233343536 (123456)
    // Index: 01
    // Length: 8 + 6 + 1 = 15 (0F)
    const packet = new CreateMasterCodePacket({
      configKey: validKey,
      index: validIndex,
      pin: validPin
    });
    const encoded = packet.encode();
    // Opcode 11 (0x11), Len 0F, ... payload ... checksum
    expect(encoded[0]).toBe(0x11);
    expect(encoded[1]).toBe(0x0f);

    const expectedPayloadHex = '313233343536373831323334353601';
    expect(bytesToHex(encoded.subarray(2, 2 + 15))).toBe(expectedPayloadHex);
  });

  it('should parse from payload correctly', () => {
    // construct payload manually
    const payload = new Uint8Array(15);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);
    payload[14] = validIndex;

    const packet = CreateMasterCodePacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
    expect(packet.index).toBe(validIndex);
  });

  it('should parse with default index 0 if payload is short (legacy/edge case handling)', () => {
    // The code says: if (payload.length > 14) index = payload[14] else 0.
    const payload = new Uint8Array(14); // Missing index byte
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = CreateMasterCodePacket.fromPayload(payload);
    expect(packet.index).toBe(0);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(
      () => new CreateMasterCodePacket({ configKey: 'invalid', index: validIndex, pin: validPin })
    ).toThrowError(BoksProtocolError);
    try {
      new CreateMasterCodePacket({ configKey: 'invalid', index: validIndex, pin: validPin });
    } catch (e) {
      expect(e).toBeInstanceOf(BoksProtocolError);
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
    }
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
    // Too short
    expect(
      () => new CreateMasterCodePacket({ configKey: validKey, index: validIndex, pin: '123' })
    ).toThrowError(BoksProtocolError);
    // Invalid char
    expect(
      () => new CreateMasterCodePacket({ configKey: validKey, index: validIndex, pin: '12345C' })
    ).toThrowError(BoksProtocolError);

    try {
      new CreateMasterCodePacket({ configKey: validKey, index: validIndex, pin: '12345C' });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PIN_FORMAT);
    }
  });

  it('should throw INVALID_INDEX_RANGE for invalid index', () => {
    expect(
      () => new CreateMasterCodePacket({ configKey: validKey, index: -1, pin: validPin })
    ).toThrowError(BoksProtocolError);
    expect(
      () => new CreateMasterCodePacket({ configKey: validKey, index: 256, pin: validPin })
    ).toThrowError(BoksProtocolError);
    expect(
      () => new CreateMasterCodePacket({ configKey: validKey, index: 1.5, pin: validPin })
    ).toThrowError(BoksProtocolError);

    try {
      new CreateMasterCodePacket({ configKey: validKey, index: 256, pin: validPin });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    }
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new CreateMasterCodePacket({
      configKey: validKey,
      index: validIndex,
      pin: validPin
    });
    const json = packet.toJSON();
    expect(json).toStrictEqual(
        Object.assign({ opcode: packet.opcode },
        Object.fromEntries(
            PayloadMapper.getFields(packet.constructor)
            .map((f: any) => [f.propertyName, (packet as any)[f.propertyName]])
        ))
    );
  });
});
