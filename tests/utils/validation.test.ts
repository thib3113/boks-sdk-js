import { describe, it, expect } from 'vitest';
import {
  validatePinCode,
  validateMasterCodeIndex,
  validateSeed,
  validateCredentialsKey,
  validateNfcUid,
} from '../../src/utils/validation';
import { BoksProtocolError, BoksProtocolErrorId } from '../../src/errors/BoksProtocolError';
import { MAX_MASTER_CODE_INDEX } from '../../src/protocol/constants';

describe('validation utils', () => {
  describe('validatePinCode', () => {
    it('should accept valid PIN codes', () => {
      expect(() => validatePinCode('123456')).not.toThrow();
      expect(() => validatePinCode('000000')).not.toThrow();
      expect(() => validatePinCode('AAAAAA')).not.toThrow();
      expect(() => validatePinCode('BBBBBB')).not.toThrow();
      expect(() => validatePinCode('1A2B34')).not.toThrow();
    });

    it('should reject PIN codes with invalid length', () => {
      expect(() => validatePinCode('12345')).toThrow(BoksProtocolError);
      expect(() => validatePinCode('1234567')).toThrow(BoksProtocolError);
    });

    it('should reject PIN codes with invalid characters', () => {
      expect(() => validatePinCode('12345C')).toThrow(BoksProtocolError);
      expect(() => validatePinCode('12345a')).toThrow(BoksProtocolError);
      expect(() => validatePinCode('123 45')).toThrow(BoksProtocolError);
    });
  });

  describe('validateMasterCodeIndex', () => {
    it('should accept valid indices', () => {
      expect(() => validateMasterCodeIndex(0)).not.toThrow();
      expect(() => validateMasterCodeIndex(MAX_MASTER_CODE_INDEX)).not.toThrow();
      expect(() => validateMasterCodeIndex(10)).not.toThrow();
    });

    it('should reject negative indices', () => {
      expect(() => validateMasterCodeIndex(-1)).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    });

    it('should reject indices out of range', () => {
      expect(() => validateMasterCodeIndex(MAX_MASTER_CODE_INDEX + 1)).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    });

    it('should reject non-integer indices', () => {
      expect(() => validateMasterCodeIndex(1.5)).toThrow(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    });
  });

  describe('validateSeed', () => {
    it('should accept valid 32-byte Uint8Array', () => {
      const seed = new Uint8Array(32).fill(0xAA);
      expect(() => validateSeed(seed)).not.toThrow();
    });

    it('should accept valid 64-character hex string', () => {
      const seed = 'A'.repeat(64);
      expect(() => validateSeed(seed)).not.toThrow();
    });

    it('should handle hex string with non-hex characters', () => {
      const seed = 'AA '.repeat(32).trim(); // 32 pairs of AA with spaces
      expect(() => validateSeed(seed)).not.toThrow();
    });

    it('should reject Uint8Array with invalid length', () => {
      expect(() => validateSeed(new Uint8Array(31))).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
      expect(() => validateSeed(new Uint8Array(33))).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
    });

    it('should reject hex string with invalid length', () => {
      expect(() => validateSeed('AA'.repeat(31))).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
      expect(() => validateSeed('AA'.repeat(33))).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
    });

    it('should reject empty string and empty Uint8Array', () => {
      expect(() => validateSeed('')).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
      expect(() => validateSeed(new Uint8Array(0))).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
    });
  });

  describe('validateCredentialsKey', () => {
    describe.each([
      { type: 'Master Key (Uint8Array)', key: new Uint8Array(32).fill(0xBB) },
      { type: 'Master Key (hex string)', key: 'B'.repeat(64) },
      { type: 'Master Key (hex string with spaces)', key: 'BB '.repeat(32).trim() },
      { type: 'Config Key (Uint8Array)', key: new Uint8Array(4).fill(0xCC) },
      { type: 'Config Key (hex string)', key: 'C'.repeat(8) },
      { type: 'Config Key (hex string with dashes)', key: 'CC-CC-CC-CC' },
      { type: 'Config Key (hex string with mixed spaces)', key: '  C C C C C C C C  ' }
    ])('valid keys: $type', ({ key }) => {
      it('should accept valid key', () => {
        expect(() => validateCredentialsKey(key)).not.toThrow();
      });
    });

    describe.each([
      { type: 'Empty Uint8Array', key: new Uint8Array(0), received: 0 },
      { type: 'Empty string', key: '', received: 0 },
      { type: 'String with only non-hex chars', key: '    ---   ', received: 0 },
      { type: '1-byte Uint8Array', key: new Uint8Array(1), received: 1 },
      { type: '1-byte hex string', key: 'AA', received: 1 },
      { type: '16-byte Uint8Array', key: new Uint8Array(16), received: 16 },
      { type: '16-byte hex string', key: 'D'.repeat(32), received: 16 },
      { type: '31-byte Uint8Array', key: new Uint8Array(31), received: 31 },
      { type: '33-byte Uint8Array', key: new Uint8Array(33), received: 33 },
      { type: '64-byte Uint8Array', key: new Uint8Array(64), received: 64 },
      { type: '64-byte hex string', key: 'E'.repeat(128), received: 64 }
    ])('invalid keys: $type', ({ key, received }) => {
      it('should reject invalid key and throw BoksProtocolError', () => {
        let caughtError: Error | null = null;
        try {
          validateCredentialsKey(key);
        } catch (error) {
          caughtError = error as Error;
        }

        expect(caughtError).toBeInstanceOf(BoksProtocolError);
        const protocolError = caughtError as BoksProtocolError;
        expect(protocolError.id).toBe(BoksProtocolErrorId.INVALID_SEED_LENGTH);
        expect(protocolError.context).toBeDefined();
        expect(protocolError.context?.received).toBe(received);
        expect(protocolError.context?.expected).toBe('32 or 4');
      });
    });
  });

  describe('validateNfcUid', () => {
    it('should accept valid UIDs (4, 7, 10 bytes)', () => {
      expect(() => validateNfcUid('AABBCCDD')).not.toThrow(); // 4 bytes
      expect(() => validateNfcUid('AA:BB:CC:DD')).not.toThrow(); // 4 bytes
      expect(() => validateNfcUid('AABBCCDDEEFF00')).not.toThrow(); // 7 bytes
      expect(() => validateNfcUid('AABBCCDDEEFF00112233')).not.toThrow(); // 10 bytes
    });

    it('should reject UIDs with invalid format', () => {
      expect(() => validateNfcUid('AABBCCGG')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT);
    });

    it('should reject UIDs with invalid length', () => {
      expect(() => validateNfcUid('AABBCC')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT); // 3 bytes
      expect(() => validateNfcUid('AABBCCDDEE')).toThrow(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT); // 5 bytes
    });
  });
});
