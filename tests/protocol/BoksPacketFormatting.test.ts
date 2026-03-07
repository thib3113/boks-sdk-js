import { describe, it, expect } from 'vitest';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

// Dummy implementation of BoksPacket to expose protected format methods
class DummyPacket extends BoksPacket {
  get opcode() { return BoksOpcode.GET_LOGS_COUNT; }
  toPayload() { return new Uint8Array(0); }

  public testFormatPin(pin: string): string {
    return this.formatPin(pin);
  }

  public testFormatNfcUid(uid: string): string {
    return this.formatNfcUid(uid);
  }

  public testFormatConfigKey(key: string): string {
    return this.formatConfigKey(key);
  }

  public testFormatSeed(seed: Uint8Array | string): string {
    return this.formatSeed(seed);
  }
}

describe('BoksPacket formatting', () => {
  const packet = new DummyPacket();

  describe('formatPin', () => {
    it('should format valid PINs to uppercase', () => {
      expect(packet.testFormatPin('123456')).toBe('123456');
      expect(packet.testFormatPin('123ab6')).toBe('123AB6'); // Mixed case
    });

    it('should throw BoksProtocolError for invalid PINs (lengths or chars)', () => {
      expect(() => packet.testFormatPin('12345')).toThrow(BoksProtocolError);
      expect(() => packet.testFormatPin('1234567')).toThrow(BoksProtocolError);
      expect(() => packet.testFormatPin('123 56')).toThrow(BoksProtocolError);
      expect(() => packet.testFormatPin('123-56')).toThrow(BoksProtocolError);
      expect(() => packet.testFormatPin('abcdef')).toThrow(BoksProtocolError); // Lowercase letters out of bounds (c, d, e, f)
    });
  });

  describe('formatNfcUid', () => {
    it('should format valid UIDs to uppercase', () => {
      expect(packet.testFormatNfcUid('01020304')).toBe('01020304');
      expect(packet.testFormatNfcUid('0102ab04')).toBe('0102AB04');
      expect(packet.testFormatNfcUid('0102ab04050607')).toBe('0102AB04050607'); // 7 bytes
      expect(packet.testFormatNfcUid('01:02:ab:04')).toBe('01:02:AB:04'); // Colons are preserved by format
    });

    it('should throw BoksProtocolError for invalid UIDs', () => {
      expect(() => packet.testFormatNfcUid('0102030')).toThrow(BoksProtocolError); // Invalid length
      expect(() => packet.testFormatNfcUid('01020X04')).toThrow(BoksProtocolError); // Invalid character
      expect(() => packet.testFormatNfcUid('')).toThrow(BoksProtocolError);
    });
  });

  describe('formatConfigKey', () => {
    it('should format valid Config Keys to uppercase', () => {
      expect(packet.testFormatConfigKey('01234567')).toBe('01234567');
      expect(packet.testFormatConfigKey('0123ab67')).toBe('0123AB67');
    });

    it('should throw BoksProtocolError for invalid Config Keys', () => {
      expect(() => packet.testFormatConfigKey('0123456')).toThrow(BoksProtocolError); // Too short
      expect(() => packet.testFormatConfigKey('012345678')).toThrow(BoksProtocolError); // Too long
      expect(() => packet.testFormatConfigKey('012X4567')).toThrow(BoksProtocolError); // Invalid char
    });
  });

  describe('formatSeed', () => {
    it('should format valid string Seeds to uppercase', () => {
      const lowerHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const upperHex = lowerHex.toUpperCase();
      expect(packet.testFormatSeed(lowerHex)).toBe(upperHex);
    });

    it('should format valid Uint8Array Seeds to uppercase hex string', () => {
      const bytes = new Uint8Array(32);
      bytes.fill(171); // 0xAB
      expect(packet.testFormatSeed(bytes)).toBe('AB'.repeat(32));
    });

    it('should throw BoksProtocolError for invalid Seeds', () => {
      expect(() => packet.testFormatSeed('0123')).toThrow(BoksProtocolError); // Too short
      expect(() => packet.testFormatSeed('X'.repeat(64))).toThrow(BoksProtocolError); // Invalid char
      expect(() => packet.testFormatSeed(' '.repeat(64))).toThrow(BoksProtocolError); // Invalid char (spaces)
      expect(() => packet.testFormatSeed(new Uint8Array(31))).toThrow(BoksProtocolError); // Bad byte array
    });
  });
});
