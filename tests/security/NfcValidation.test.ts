import { describe, it, expect } from 'vitest';
import { NfcRegisterPacket } from '@/protocol/downlink/NfcRegisterPacket';
import { UnregisterNfcTagPacket } from '@/protocol/downlink/UnregisterNfcTagPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

describe('NFC Security Validation', () => {
  const configKey = 'AABBCCDD';

  describe('NfcRegisterPacket', () => {
    it('should reject non-hex characters', () => {
      expect(() => new NfcRegisterPacket(configKey, 'ZZZZZZZZ')).toThrowError(BoksProtocolError);
      try {
        new NfcRegisterPacket(configKey, 'ZZZZZZZZ');
      } catch (e) {
        expect(e).toBeInstanceOf(BoksProtocolError);
        expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT);
      }
    });

    it('should reject too short UIDs (< 4 bytes)', () => {
      expect(() => new NfcRegisterPacket(configKey, 'AABBCC')).toThrowError(BoksProtocolError); // 3 bytes
    });

    it('should reject too long UIDs (> 10 bytes)', () => {
      const tooLong = 'A'.repeat(22); // 11 bytes
      expect(() => new NfcRegisterPacket(configKey, tooLong)).toThrowError(BoksProtocolError);
    });

    it('should reject odd length strings', () => {
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDDD')).toThrowError(BoksProtocolError);
    });

    it('should accept valid UIDs (4, 7, 10 bytes)', () => {
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDD')).not.toThrow(); // 4 bytes
      expect(() => new NfcRegisterPacket(configKey, 'AA:BB:CC:DD')).not.toThrow(); // 4 bytes
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDDEEFF00')).not.toThrow(); // 7 bytes
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDDEEFF00112233')).not.toThrow(); // 10 bytes
    });

    it('should reject invalid length UIDs (5, 6, 8, 9 bytes)', () => {
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDDEE')).toThrowError(BoksProtocolError); // 5 bytes
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDDEEFF')).toThrowError(BoksProtocolError); // 6 bytes
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDDEEFF0011')).toThrowError(BoksProtocolError); // 8 bytes
      expect(() => new NfcRegisterPacket(configKey, 'AABBCCDDEEFF001122')).toThrowError(BoksProtocolError); // 9 bytes
    });
  });

  describe('UnregisterNfcTagPacket', () => {
    it('should reject invalid UIDs', () => {
        expect(() => new UnregisterNfcTagPacket(configKey, 'ZZZZ')).toThrowError(BoksProtocolError);
    });
  });
});
