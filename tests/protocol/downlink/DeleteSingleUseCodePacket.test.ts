import { describe, it, expect } from 'vitest';
import { DeleteSingleUseCodePacket } from '@/protocol/downlink/DeleteSingleUseCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('DeleteSingleUseCodePacket', () => {
  const validKey = 'ABCDEF12';
  const validPin = '123456';

  it('should construct with valid parameters', () => {
    const packet = new DeleteSingleUseCodePacket(validKey, validPin);
    expect(packet.opcode).toBe(BoksOpcode.DELETE_SINGLE_USE_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new DeleteSingleUseCodePacket(validKey, validPin);
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x0D);
    expect(encoded[1]).toBe(14);

    const expectedPayload = '4142434445463132313233343536';
    expect(bytesToHex(encoded.subarray(2, 16))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(14);
    payload.set(stringToBytes(validKey), 0);
    payload.set(stringToBytes(validPin), 8);

    const packet = DeleteSingleUseCodePacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new DeleteSingleUseCodePacket('invalid', validPin)).toThrowError(BoksProtocolError);
     try {
       new DeleteSingleUseCodePacket('invalid', validPin);
     } catch (e) {
       expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
     }
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
      expect(() => new DeleteSingleUseCodePacket(validKey, '123')).toThrowError(BoksProtocolError);
      expect(() => new DeleteSingleUseCodePacket(validKey, '12345C')).toThrowError(BoksProtocolError);

      try {
        new DeleteSingleUseCodePacket(validKey, '12345C');
      } catch (e) {
         expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PIN_FORMAT);
      }
  });

  it('should fail parsing if payload is too short', () => {
      const shortPayload = new Uint8Array(10);
      expect(() => DeleteSingleUseCodePacket.fromPayload(shortPayload)).toThrowError(BoksProtocolError);
  });
});
