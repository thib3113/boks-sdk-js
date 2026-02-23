import { describe, it, expect } from 'vitest';
import { RegeneratePartAPacket } from '@/protocol/downlink/RegeneratePartAPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('RegeneratePartAPacket', () => {
  const validKey = '12345678';
  const validPart = new Uint8Array(16).map((_, i) => i);

  it('should construct with valid parameters', () => {
    const packet = new RegeneratePartAPacket(validKey, validPart);
    expect(packet.opcode).toBe(BoksOpcode.RE_GENERATE_CODES_PART1);
    expect(packet.configKey).toBe(validKey);
    expect(packet.part).toEqual(validPart);
  });

  it('should encode correctly', () => {
    const packet = new RegeneratePartAPacket(validKey, validPart);
    const encoded = packet.encode();
    // 0x20 + 24 (8+16) + ...
    expect(encoded[0]).toBe(0x20);
    expect(encoded[1]).toBe(24);

    // Key "12345678" -> 3132333435363738
    // Part -> 000102030405060708090A0B0C0D0E0F
    const expectedPayload = '3132333435363738000102030405060708090A0B0C0D0E0F';
    expect(bytesToHex(encoded.subarray(2, 26))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(24);
    payload.set(stringToBytes(validKey), 0);
    payload.set(validPart, 8);

    const packet = RegeneratePartAPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.part).toEqual(validPart);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new RegeneratePartAPacket('invalid', validPart)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_VALUE for invalid part length', () => {
      const shortPart = new Uint8Array(15);
      expect(() => new RegeneratePartAPacket(validKey, shortPart)).toThrowError(BoksProtocolError);
      try {
        new RegeneratePartAPacket(validKey, shortPart);
      } catch (e) {
         expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_VALUE);
      }
  });

  it('should fail parsing if payload is too short (part incomplete)', () => {
      // slice(8, 24) handles short arrays by returning what's there.
      // Constructor checks length.
      const payload = new Uint8Array(20);
      payload.set(stringToBytes(validKey), 0);

      expect(() => RegeneratePartAPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
  });
});
