import { describe, it, expect } from 'vitest';
import { RegeneratePartBPacket } from '@/protocol/downlink/RegeneratePartBPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('RegeneratePartBPacket', () => {
  const validKey = '12345678';
  const validPart = new Uint8Array(16).map((_, i) => i + 16);

  it('should construct with valid parameters', () => {
    const packet = new RegeneratePartBPacket({ configKey: validKey, part: validPart });
    expect(packet.opcode).toBe(BoksOpcode.RE_GENERATE_CODES_PART2);
    expect(packet.configKey).toBe(validKey);
    expect(packet.part).toEqual('101112131415161718191A1B1C1D1E1F');
  });

  it('should encode correctly', () => {
    const packet = new RegeneratePartBPacket({ configKey: validKey, part: validPart });
    const encoded = packet.encode();
    // 0x21 + 24 (8+16) + ...
    expect(encoded[0]).toBe(0x21);
    expect(encoded[1]).toBe(24);

    const expectedPayload = '3132333435363738101112131415161718191A1B1C1D1E1F';
    expect(bytesToHex(encoded.subarray(2, 26)).toUpperCase()).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(24);
    payload.set(stringToBytes(validKey), 0);
    payload.set(validPart, 8);

    const packet = RegeneratePartBPacket.fromRaw(buildMockRawPacket(RegeneratePartBPacket.opcode, payload));
    expect(packet.configKey).toBe(validKey);
    expect(packet.part).toEqual('101112131415161718191A1B1C1D1E1F');
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(() => new RegeneratePartBPacket({ configKey: 'invalid', part: validPart })).toThrowError(
      BoksProtocolError
    );
  });

  it('should throw INVALID_VALUE for invalid part length', () => {
    const shortPart = new Uint8Array(15);
    expect(() => new RegeneratePartBPacket({ configKey: validKey, part: shortPart })).toThrowError(
      BoksProtocolError
    );
    try {
      new RegeneratePartBPacket({ configKey: validKey, part: shortPart });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH);
    }
  });

  it('should fail parsing if payload is too short', () => {
    const payload = new Uint8Array(20);
    payload.set(stringToBytes(validKey), 0);

    expect(() => RegeneratePartBPacket.fromRaw(buildMockRawPacket(RegeneratePartBPacket.opcode, payload))).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new RegeneratePartBPacket({ configKey: validKey, part: validPart });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "opcode": 33,
        "part": "101112131415161718191A1B1C1D1E1F",
      });
  });
});
