import { describe, it, expect } from 'vitest';
import { GenerateCodesPacket } from '@/protocol/downlink/GenerateCodesPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('GenerateCodesPacket', () => {
  const validSeedHex = '000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F';
  const validSeedBytes = new Uint8Array(32).map((_, i) => i);

  it('should construct with valid parameters (hex string)', () => {
    const packet = new GenerateCodesPacket('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F');
    expect(packet.opcode).toBe(BoksOpcode.GENERATE_CODES);
    expect(packet.seed).toBe(validSeedHex);
  });

  it('should construct with valid parameters (Uint8Array)', () => {
    const packet = new GenerateCodesPacket(validSeedBytes);
    expect(packet.opcode).toBe(BoksOpcode.GENERATE_CODES);
    expect(packet.toPayload()).toEqual(validSeedBytes);
  });

  it('should encode correctly', () => {
    const packet = new GenerateCodesPacket(validSeedBytes);
    const encoded = packet.encode();
    // 0x10 + len(32) + seed(32) + checksum
    expect(encoded[0]).toBe(0x10);
    expect(encoded[1]).toBe(32);
    expect(bytesToHex(encoded.subarray(2, 34))).toBe(validSeedHex);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const seed = '00'.repeat(32);
    const packet = new GenerateCodesPacket(seed);
    const encoded = packet.encode();
    // Opcode 0x10, Len 32 (0x20), Seed all 00, Checksum 0x30
    expect(bytesToHex(encoded)).toBe('1020' + seed + '30');
  });

  it('should parse from payload correctly', () => {
    const packet = GenerateCodesPacket.fromPayload(validSeedBytes);
    expect(packet.toPayload()).toEqual(validSeedBytes);
  });

  it('should throw INVALID_SEED_LENGTH for invalid seed length', () => {
    const shortSeed = new Uint8Array(31);
    expect(() => new GenerateCodesPacket(shortSeed)).toThrowError(BoksProtocolError);

    const shortHex = '0001';
    expect(() => new GenerateCodesPacket(shortHex)).toThrowError(BoksProtocolError);

    try {
      new GenerateCodesPacket(shortSeed);
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_SEED_LENGTH);
    }
  });
});

describe('error handling', () => {
  it('should throw Error if seed length is not exactly 32 bytes in toPayload', () => {
    // Create valid packet first
    const validSeedStr = '00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF';
    const packet = new GenerateCodesPacket(validSeedStr);

    // Forcefully alter the internal seed string directly to bypass constructor validation
    expect(() => {
      packet.seed = '00112233445566778899AABBCCDDEEFF';
    }).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new GenerateCodesPacket('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F');
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 16,
        "seed": "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F",
      });
  });
});
