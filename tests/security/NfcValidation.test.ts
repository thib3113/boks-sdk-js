import { describe, it, expect } from 'vitest';
import { NfcRegisterPacket } from '@/protocol/downlink/NfcRegisterPacket';
import { UnregisterNfcTagPacket } from '@/protocol/downlink/UnregisterNfcTagPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

describe('NFC Security Validation', () => {
  const configKey = 'AABBCCDD';

  describe('NfcRegisterPacket', () => {
    it('should reject non-hex characters', () => {
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'ZZZZZZZZ' })).toThrowError(BoksProtocolError);
      try {
        new NfcRegisterPacket({ configKey: configKey, uid: 'ZZZZZZZZ' });
      } catch (e) {
        expect(e).toBeInstanceOf(BoksProtocolError);
        expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT);
      }
    });

    it('should reject too short UIDs (< 4 bytes)', () => {
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCC' })).toThrowError(BoksProtocolError); // 3 bytes
    });

    it('should reject too long UIDs (> 10 bytes)', () => {
      const tooLong = 'A'.repeat(22); // 11 bytes
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: tooLong })).toThrowError(BoksProtocolError);
    });

    it('should reject odd length strings', () => {
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDDD' })).toThrowError(BoksProtocolError);
    });

    it('should accept valid UIDs (4, 7, 10 bytes)', () => {
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDD' })).not.toThrow(); // 4 bytes
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AA:BB:CC:DD' })).not.toThrow(); // 4 bytes
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDDEEFF00' })).not.toThrow(); // 7 bytes
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDDEEFF00112233' })).not.toThrow(); // 10 bytes
    });

    it('should reject invalid length UIDs (5, 6, 8, 9 bytes)', () => {
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDDEE' })).toThrowError(BoksProtocolError); // 5 bytes
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDDEEFF' })).toThrowError(BoksProtocolError); // 6 bytes
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDDEEFF0011' })).toThrowError(BoksProtocolError); // 8 bytes
      expect(() => new NfcRegisterPacket({ configKey: configKey, uid: 'AABBCCDDEEFF001122' })).toThrowError(BoksProtocolError); // 9 bytes
    });
  });

  describe('UnregisterNfcTagPacket', () => {
    it('should reject invalid UIDs', () => {
        expect(() => new UnregisterNfcTagPacket({ configKey: configKey, uid: 'ZZZZ' })).toThrowError(BoksProtocolError);
    });
  });
});
