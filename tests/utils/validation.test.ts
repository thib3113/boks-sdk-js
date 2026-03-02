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
    it('should accept valid 32-byte key (Master Key)', () => {
      const key = new Uint8Array(32).fill(0xBB);
      expect(() => validateCredentialsKey(key)).not.toThrow();
      expect(() => validateCredentialsKey('B'.repeat(64))).not.toThrow();
    });

    it('should accept valid 4-byte key (Config Key)', () => {
      const key = new Uint8Array(4).fill(0xCC);
      expect(() => validateCredentialsKey(key)).not.toThrow();
      expect(() => validateCredentialsKey('C'.repeat(8))).not.toThrow();
    });

    it('should reject keys with other lengths', () => {
      expect(() => validateCredentialsKey(new Uint8Array(16))).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
      expect(() => validateCredentialsKey('D'.repeat(10))).toThrow(BoksProtocolErrorId.INVALID_SEED_LENGTH);
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
