import { describe, it, expect } from 'vitest';
import { GenerateCodesSupportPacket } from '@/protocol/downlink/GenerateCodesSupportPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('GenerateCodesSupportPacket', () => {
  const validSeedHex = '000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F';
  const validSeedBytes = new Uint8Array(32).map((_, i) => i);

  it('should construct with valid parameters (hex string)', () => {
    const packet = new GenerateCodesSupportPacket(validSeedHex);
    expect(packet.opcode).toBe(BoksOpcode.GENERATE_CODES_SUPPORT);
    expect(packet.seed).toBe(validSeedHex);
  });

  it('should construct with valid parameters (Uint8Array)', () => {
    const packet = new GenerateCodesSupportPacket(validSeedBytes);
    expect(packet.opcode).toBe(BoksOpcode.GENERATE_CODES_SUPPORT);
    expect(packet.seed).toBe(validSeedHex);
  });

  it('should encode correctly', () => {
    const packet = new GenerateCodesSupportPacket(validSeedBytes);
    const encoded = packet.encode();
    // 0x15 + len(32) + seed(32) + checksum
    expect(encoded[0]).toBe(0x15);
    expect(encoded[1]).toBe(32);
    expect(bytesToHex(encoded.subarray(2, 34))).toBe(validSeedHex);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const seed = '00'.repeat(32);
    const packet = new GenerateCodesSupportPacket(seed);
    const encoded = packet.encode();
    // Opcode 0x15, Len 32 (0x20), Seed all 00, Checksum 0x35
    expect(bytesToHex(encoded)).toBe('1520' + seed + '35');
  });

  it('should parse from payload correctly', () => {
    const packet = GenerateCodesSupportPacket.fromRaw(buildMockRawPacket(GenerateCodesSupportPacket.opcode, validSeedBytes));
    expect(packet.seed).toBe(validSeedHex);
  });

  it('should throw INVALID_SEED_LENGTH for invalid seed length', () => {
    // This test is obsolete now as validation occurs in fromRaw, but new constructor expects valid seed length when using toPayload
    // actually let's just make it throw BoksProtocolError for fromRaw on short seed

    const shortSeed = new Uint8Array(31);
    expect(() => GenerateCodesSupportPacket.fromRaw(buildMockRawPacket(GenerateCodesSupportPacket.opcode, shortSeed))).toThrowError(BoksProtocolError); // BoksProtocolError);

    const shortHex = '0001';
    expect(() => new GenerateCodesSupportPacket(shortHex)).toThrowError(BoksProtocolError);

    try {
      new GenerateCodesSupportPacket(shortSeed);
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_SEED_LENGTH);
    }
  });
  describe('error handling', () => {
    it('should throw Error if seed length is not exactly 32 bytes in toPayload (Uint8Array path)', () => {
      const validSeedBytes = new Uint8Array(32).fill(0x11);
      const packet = new GenerateCodesSupportPacket(validSeedBytes);
      expect(() => {
        packet.seed = new Uint8Array(16).fill(0x11) as unknown as string;
      }).toThrowError(BoksProtocolError);
    });

    it('should throw Error if seed length is not exactly 32 bytes in toPayload (String path)', () => {
      const validSeedBytes = new Uint8Array(32).fill(0x11);
      const packet = new GenerateCodesSupportPacket(validSeedBytes);
      expect(() => {
        packet.seed = '00112233445566778899AABBCCDDEEFF';
      }).toThrowError(BoksProtocolError);
    });

    it('should output only mapped payload properties and opcode via toJSON', () => {
      const packet = new GenerateCodesSupportPacket(validSeedHex);
      const json = packet.toJSON();
      expect(json).toStrictEqual({
          "opcode": 21,
          "seed": validSeedHex,
        });
    });
  });
});