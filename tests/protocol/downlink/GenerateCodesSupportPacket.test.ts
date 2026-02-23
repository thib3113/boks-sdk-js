import { describe, it, expect } from 'vitest';
import { GenerateCodesSupportPacket } from '@/protocol/downlink/GenerateCodesSupportPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

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
    expect(packet.seed).toEqual(validSeedBytes);
  });

  it('should encode correctly', () => {
    const packet = new GenerateCodesSupportPacket(validSeedBytes);
    const encoded = packet.encode();
    // 0x15 + len(32) + seed(32) + checksum
    expect(encoded[0]).toBe(0x15);
    expect(encoded[1]).toBe(32);
    expect(bytesToHex(encoded.subarray(2, 34))).toBe(validSeedHex);
  });

  it('should parse from payload correctly', () => {
    const packet = GenerateCodesSupportPacket.fromPayload(validSeedBytes);
    expect(packet.seed).toEqual(validSeedBytes);
  });

  it('should throw INVALID_SEED_LENGTH for invalid seed length', () => {
      const shortSeed = new Uint8Array(31);
      expect(() => new GenerateCodesSupportPacket(shortSeed)).toThrowError(BoksProtocolError);

      const shortHex = '0001';
      expect(() => new GenerateCodesSupportPacket(shortHex)).toThrowError(BoksProtocolError);

      try {
        new GenerateCodesSupportPacket(shortSeed);
      } catch (e) {
         expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_SEED_LENGTH);
      }
  });
});
