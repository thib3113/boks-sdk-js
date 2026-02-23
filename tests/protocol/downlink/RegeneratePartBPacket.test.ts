import { describe, it, expect } from 'vitest';
import { RegeneratePartBPacket } from '@/protocol/downlink/RegeneratePartBPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('RegeneratePartBPacket', () => {
  const validKey = '12345678';
  const validPart = new Uint8Array(16).map((_, i) => i);

  it('should construct with valid parameters', () => {
    const packet = new RegeneratePartBPacket(validKey, validPart);
    expect(packet.opcode).toBe(BoksOpcode.RE_GENERATE_CODES_PART2);
    expect(packet.configKey).toBe(validKey);
    expect(packet.part).toEqual(validPart);
  });

  it('should encode correctly', () => {
    const packet = new RegeneratePartBPacket(validKey, validPart);
    const encoded = packet.encode();
    // 0x21 + 24 (8+16) + ...
    expect(encoded[0]).toBe(0x21);
    expect(encoded[1]).toBe(24);

    const expectedPayload = '3132333435363738000102030405060708090A0B0C0D0E0F';
    expect(bytesToHex(encoded.subarray(2, 26))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(24);
    payload.set(stringToBytes(validKey), 0);
    payload.set(validPart, 8);

    const packet = RegeneratePartBPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.part).toEqual(validPart);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new RegeneratePartBPacket('invalid', validPart)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_VALUE for invalid part length', () => {
      const shortPart = new Uint8Array(15);
      expect(() => new RegeneratePartBPacket(validKey, shortPart)).toThrowError(BoksProtocolError);
      try {
        new RegeneratePartBPacket(validKey, shortPart);
      } catch (e) {
         expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_VALUE);
      }
  });

  it('should fail parsing if payload is too short', () => {
      const payload = new Uint8Array(20);
      payload.set(stringToBytes(validKey), 0);

      expect(() => RegeneratePartBPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
  });
});
