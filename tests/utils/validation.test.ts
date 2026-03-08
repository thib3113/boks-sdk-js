import { describe, it, expect } from 'vitest';
import {
  validatePinCode,
  validateMasterCodeIndex,
  validateSeed,
  validateCredentialsKey,
  validateNfcUid
} from '@/utils/validation';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

describe('validation utils', () => {
  describe('validatePinCode', () => {
    it('should accept valid PIN codes', () => {
      expect(() => validatePinCode('123456')).not.toThrow();
      expect(() => validatePinCode('000000')).not.toThrow();
      expect(() => validatePinCode('999999')).not.toThrow();
      expect(() => validatePinCode('AAAAAA')).not.toThrow();
      expect(() => validatePinCode('BBBBBB')).not.toThrow();
      expect(() => validatePinCode('123AB6')).not.toThrow();
    });

    it('should reject PIN codes with invalid length', () => {
      expect(() => validatePinCode('12345')).toThrow(BoksProtocolError);
      expect(() => validatePinCode('1234567')).toThrow(BoksProtocolError);
      expect(() => validatePinCode('')).toThrow(BoksProtocolError);
    });

    it('should reject PIN codes with invalid characters', () => {
      expect(() => validatePinCode('123C56')).toThrow(BoksProtocolError); // C is invalid
      //expect(() => validatePinCode('123a56')).toThrow(BoksProtocolError); // a is invalid (must be uppercase)
      expect(() => validatePinCode('123 56')).toThrow(BoksProtocolError); // space is invalid
      expect(() => validatePinCode('12-456')).toThrow(BoksProtocolError); // dash is invalid
    });
  });

  describe('validateMasterCodeIndex', () => {
    it('should accept valid indices', () => {
      expect(() => validateMasterCodeIndex(0)).not.toThrow();
      expect(() => validateMasterCodeIndex(5)).not.toThrow();
      expect(() => validateMasterCodeIndex(255)).not.toThrow();
    });

    it('should reject negative indices', () => {
      expect(() => validateMasterCodeIndex(-1)).toThrow(BoksProtocolError);
    });

    it('should reject indices out of range', () => {
      expect(() => validateMasterCodeIndex(256)).toThrow(BoksProtocolError);
      expect(() => validateMasterCodeIndex(300)).toThrow(BoksProtocolError);
    });

    it('should reject non-integer indices', () => {
      expect(() => validateMasterCodeIndex(1.5)).toThrow(BoksProtocolError);
    });
  });

  describe('validateSeed', () => {
    it('should accept valid 32-byte Uint8Array', () => {
      expect(() => validateSeed(new Uint8Array(32))).not.toThrow();
    });

    it('should accept valid 64-character hex string', () => {
      const validHex = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
      expect(() => validateSeed(validHex)).not.toThrow();
      expect(() => validateSeed(validHex.toLowerCase())).not.toThrow(); // Should allow lowercase hex
    });

    it('should reject hex string with non-hex characters', () => {
      const invalidHex = 'XX'.repeat(32);
      expect(() => validateSeed(invalidHex)).toThrow(BoksProtocolError);
    });

    it('should reject Uint8Array with invalid length', () => {
      expect(() => validateSeed(new Uint8Array(31))).toThrow(BoksProtocolError);
      expect(() => validateSeed(new Uint8Array(33))).toThrow(BoksProtocolError);
    });

    it('should reject hex string with invalid length', () => {
      expect(() => validateSeed('AA'.repeat(31))).toThrow(BoksProtocolError);
      expect(() => validateSeed('AA'.repeat(33))).toThrow(BoksProtocolError);
    });

    it('should reject empty string and empty Uint8Array', () => {
      expect(() => validateSeed('')).toThrow(BoksProtocolError);
      expect(() => validateSeed(new Uint8Array(0))).toThrow(BoksProtocolError);
    });
  });

  describe('validateCredentialsKey', () => {
    describe.each([
      { type: 'Master Key (Uint8Array)', key: new Uint8Array(32) },
      { type: 'Master Key (hex string)', key: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF' },
      { type: 'Config Key (Uint8Array)', key: new Uint8Array(4) },
      { type: 'Config Key (hex string)', key: '01234567' }
    ])('valid keys: $type', ({ key }) => {
      it('should accept valid key', () => {
        expect(() => validateCredentialsKey(key)).not.toThrow();
      });
    });

    describe.each([
      { type: 'Empty string', key: '', received: 0, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH },
      { type: 'String with only non-hex chars', key: 'xxxxxxxx', received: 8, errorId: BoksProtocolErrorId.INVALID_VALUE },
      { type: 'String with spaces', key: '0123 567', received: 8, errorId: BoksProtocolErrorId.INVALID_VALUE },
      { type: 'String with dashes', key: '0123-567', received: 8, errorId: BoksProtocolErrorId.INVALID_VALUE },
      { type: '1-byte hex string', key: '12', received: 2, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH },
      { type: '16-byte hex string', key: '0123456789ABCDEF0123456789ABCDEF', received: 32, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH },
      { type: '64-byte hex string', key: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF', received: 128, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH },
      { type: 'Empty Uint8Array', key: new Uint8Array(0), received: 0, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH },
      { type: '1-byte Uint8Array', key: new Uint8Array(1), received: 1, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH },
      { type: '16-byte Uint8Array', key: new Uint8Array(16), received: 16, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH },
      { type: '64-byte Uint8Array', key: new Uint8Array(64), received: 64, errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH }
    ])('invalid keys: $type', ({ key, received, errorId }) => {
      it('should reject invalid key and throw BoksProtocolError', () => {
        let error: unknown;
        try {
          validateCredentialsKey(key);
        } catch (e) {
          error = e;
        }

        expect(error).toBeInstanceOf(BoksProtocolError);
        const protocolError = error as BoksProtocolError;
        expect(protocolError.id).toBe(errorId);
        if (errorId === BoksProtocolErrorId.INVALID_SEED_LENGTH) {
          expect(protocolError.context).toBeDefined();
          expect(protocolError.context?.received).toBe(received);
          expect(protocolError.context?.expected).toBe(typeof key === 'string' ? '8 or 64' : '32 or 4');
        }
      });
    });
  });

  describe('validateNfcUid', () => {
    it('should accept valid UIDs (4, 7, 10 bytes)', () => {
      expect(() => validateNfcUid('01020304')).not.toThrow(); // 4 bytes
      expect(() => validateNfcUid('01:02:03:04')).not.toThrow(); // 4 bytes with colons
      expect(() => validateNfcUid('01020304050607')).not.toThrow(); // 7 bytes
      expect(() => validateNfcUid('01:02:03:04:05:06:07')).not.toThrow(); // 7 bytes with colons
      expect(() => validateNfcUid('0102030405060708090A')).not.toThrow(); // 10 bytes
      expect(() => validateNfcUid('01:02:03:04:05:06:07:08:09:0A')).not.toThrow(); // 10 bytes with colons
    });

    it('should reject UIDs with invalid format', () => {
      // @ts-expect-error Testing invalid type
      expect(() => validateNfcUid(1234)).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT);
      expect(() => validateNfcUid('')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT);
      expect(() => validateNfcUid('01020G04')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT); // Non-hex character
    });

    it('should reject UIDs with invalid length', () => {
      expect(() => validateNfcUid('0102030405')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT); // 5 bytes
      expect(() => validateNfcUid('010203040506070809')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT); // 9 bytes
      expect(() => validateNfcUid('0102030405060708090A0B')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT); // 11 bytes
    });
  });
});
