import { describe, it, expect } from 'vitest';
import {
  validatePinCode,
  validateMasterCodeIndex,
  validateSeed,
  validateCredentialsKey,
  validateNfcUid
} from '@/utils/validation';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksExpectedReason } from '@/errors/BoksExpectedReason';

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
      expect(() => validatePinCode('12345')).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_PIN_FORMAT,
          'PIN must be exactly 6 characters using only 0-9, A, and B',
          { received: 5, expected: 6 }
        )
      );
      expect(() => validatePinCode('1234567')).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_PIN_FORMAT,
          'PIN must be exactly 6 characters using only 0-9, A, and B',
          { received: 7, expected: 6 }
        )
      );
      expect(() => validatePinCode('')).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_PIN_FORMAT,
          'PIN must be exactly 6 characters using only 0-9, A, and B',
          { received: 0, expected: 6 }
        )
      );
    });

    it('should reject PIN codes with invalid characters', () => {
      expect(() => validatePinCode('123C56')).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_PIN_FORMAT,
          'PIN must be exactly 6 characters using only 0-9, A, and B',
          { received: '123C56', expected: BoksExpectedReason.PIN_CODE_FORMAT }
        )
      ); // C is invalid
      //expect(() => validatePinCode('123a56')).toThrow(BoksProtocolError); // a is invalid (must be uppercase)
      expect(() => validatePinCode('123 56')).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_PIN_FORMAT,
          'PIN must be exactly 6 characters using only 0-9, A, and B',
          { received: '123 56', expected: BoksExpectedReason.PIN_CODE_FORMAT }
        )
      ); // space is invalid
      expect(() => validatePinCode('12-456')).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_PIN_FORMAT,
          'PIN must be exactly 6 characters using only 0-9, A, and B',
          { received: '12-456', expected: BoksExpectedReason.PIN_CODE_FORMAT }
        )
      ); // dash is invalid
    });
  });

  describe('validateMasterCodeIndex', () => {
    it('should accept valid indices', () => {
      expect(() => validateMasterCodeIndex(0)).not.toThrow();
      expect(() => validateMasterCodeIndex(5)).not.toThrow();
      expect(() => validateMasterCodeIndex(255)).not.toThrow();
    });

    it('should reject negative indices', () => {
      expect(() => validateMasterCodeIndex(-1)).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_INDEX_RANGE, undefined, {
          received: -1,
          expected: '0 to 255'
        })
      );
    });

    it('should reject indices out of range', () => {
      expect(() => validateMasterCodeIndex(256)).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_INDEX_RANGE, undefined, {
          received: 256,
          expected: '0 to 255'
        })
      );
      expect(() => validateMasterCodeIndex(300)).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_INDEX_RANGE, undefined, {
          received: 300,
          expected: '0 to 255'
        })
      );
    });

    it('should reject non-integer indices', () => {
      expect(() => validateMasterCodeIndex(1.5)).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_INDEX_RANGE, undefined, {
          received: 1.5,
          expected: '0 to 255'
        })
      );
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
      expect(() => validateSeed(invalidHex)).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_VALUE,
          'Seed string must contain only valid hex characters',
          { received: invalidHex, expected: BoksExpectedReason.VALID_HEX_CHAR }
        )
      );
    });

    it('should reject Uint8Array with invalid length', () => {
      expect(() => validateSeed(new Uint8Array(31))).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_SEED_LENGTH, undefined, {
          received: 31,
          expected: 32
        })
      );
      expect(() => validateSeed(new Uint8Array(33))).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_SEED_LENGTH, undefined, {
          received: 33,
          expected: 32
        })
      );
    });

    it('should reject hex string with invalid length', () => {
      expect(() => validateSeed('AA'.repeat(31))).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_SEED_LENGTH,
          'Seed string must be exactly 64 hex characters',
          { received: 62, expected: 64 }
        )
      );
      expect(() => validateSeed('AA'.repeat(33))).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_SEED_LENGTH,
          'Seed string must be exactly 64 hex characters',
          { received: 66, expected: 64 }
        )
      );
    });

    it('should reject empty string and empty Uint8Array', () => {
      expect(() => validateSeed('')).toThrowError(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_SEED_LENGTH,
          'Seed string must be exactly 64 hex characters',
          { received: 0, expected: 64 }
        )
      );
      expect(() => validateSeed(new Uint8Array(0))).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_SEED_LENGTH, undefined, {
          received: 0,
          expected: 32
        })
      );
    });
  });

  describe('validateCredentialsKey', () => {
    describe.each([
      { type: 'Master Key (Uint8Array)', key: new Uint8Array(32) },
      {
        type: 'Master Key (hex string)',
        key: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
      },
      { type: 'Config Key (Uint8Array)', key: new Uint8Array(4) },
      { type: 'Config Key (hex string)', key: '01234567' }
    ])('valid keys: $type', ({ key }) => {
      it('should accept valid key', () => {
        expect(() => validateCredentialsKey(key)).not.toThrow();
      });
    });

    describe.each([
      {
        type: 'Empty string',
        key: '',
        received: 0,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      },
      {
        type: 'String with only non-hex chars',
        key: 'xxxxxxxx',
        received: 8,
        errorId: BoksProtocolErrorId.INVALID_VALUE
      },
      {
        type: 'String with spaces',
        key: '0123 567',
        received: 8,
        errorId: BoksProtocolErrorId.INVALID_VALUE
      },
      {
        type: 'String with dashes',
        key: '0123-567',
        received: 8,
        errorId: BoksProtocolErrorId.INVALID_VALUE
      },
      {
        type: '1-byte hex string',
        key: '12',
        received: 2,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      },
      {
        type: '16-byte hex string',
        key: '0123456789ABCDEF0123456789ABCDEF',
        received: 32,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      },
      {
        type: '64-byte hex string',
        key: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
        received: 128,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      },
      {
        type: 'Empty Uint8Array',
        key: new Uint8Array(0),
        received: 0,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      },
      {
        type: '1-byte Uint8Array',
        key: new Uint8Array(1),
        received: 1,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      },
      {
        type: '16-byte Uint8Array',
        key: new Uint8Array(16),
        received: 16,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      },
      {
        type: '64-byte Uint8Array',
        key: new Uint8Array(64),
        received: 64,
        errorId: BoksProtocolErrorId.INVALID_SEED_LENGTH
      }
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
          expect(protocolError.context?.expected).toBe(
            typeof key === 'string' ? '8 or 64' : '32 or 4'
          );
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
      expect(() => validateNfcUid(1234)).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
          received: 'number',
          expected: 'string',
          reason: 'NOT_HEX'
        })
      );
      expect(() => validateNfcUid('')).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
          received: '',
          expected: BoksExpectedReason.VALID_HEX_CHAR,
          reason: 'NOT_HEX'
        })
      );
      expect(() => validateNfcUid('01020G04')).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
          received: '01020G04',
          expected: BoksExpectedReason.VALID_HEX_CHAR,
          reason: 'NOT_HEX'
        })
      ); // Non-hex character
    });
    it('should reject UIDs with invalid length', () => {
      expect(() => validateNfcUid('0102030405')).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
          received: 10,
          expected: BoksExpectedReason.NFC_UID_FORMAT,
          reason: 'INVALID_LENGTH'
        })
      );
      expect(() => validateNfcUid('010203040506070809')).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
          received: 18,
          expected: BoksExpectedReason.NFC_UID_FORMAT,
          reason: 'INVALID_LENGTH'
        })
      );
      expect(() => validateNfcUid('0102030405060708090A0B')).toThrowError(
        new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
          received: 22,
          expected: BoksExpectedReason.NFC_UID_FORMAT,
          reason: 'INVALID_LENGTH'
        })
      );
    });
  });
});
