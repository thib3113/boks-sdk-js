import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { MAX_MASTER_CODE_INDEX } from '@/protocol/constants';

/**
 * Validates a Boks PIN code.
 * A valid PIN must be exactly 6 characters long and only contain 0-9, A or B.
 *
 * @param pin The PIN code to validate.
 * @throws BoksProtocolError if the PIN is invalid.
 */
export function validatePinCode(pin: string): void {
  if (!/^[0-9A-B]{6}$/.test(pin)) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_PIN_FORMAT, undefined, {
      received: pin
    });
  }
}

/**
 * Validates a Master Code index.
 * Must be an integer between 0 and MAX_MASTER_CODE_INDEX.
 *
 * @param index The index to validate.
 * @throws BoksProtocolError if the index is invalid.
 */
export function validateMasterCodeIndex(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index > MAX_MASTER_CODE_INDEX) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_INDEX_RANGE, undefined, {
      received: index,
      max: MAX_MASTER_CODE_INDEX
    });
  }
}

/**
 * Validates a 32-byte seed/key.
 *
 * @param seed The seed to validate (Uint8Array or hex string).
 * @throws BoksProtocolError if the seed is invalid.
 */
export function validateSeed(seed: Uint8Array | string): void {
  const len = typeof seed === 'string' ? seed.replace(/[^0-9A-Fa-f]/g, '').length / 2 : seed.length;
  if (len !== 32) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_SEED_LENGTH, undefined, {
      received: len,
      expected: 32
    });
  }
}

/**
 * Validates a credential key (Master Key or Config Key).
 *
 * @param key The key to validate (Uint8Array or hex string).
 * @throws BoksProtocolError if the key length is invalid.
 */
export function validateCredentialsKey(key: Uint8Array | string): void {
  const len = typeof key === 'string' ? key.replace(/[^0-9A-Fa-f]/g, '').length / 2 : key.length;
  if (len !== 32 && len !== 4) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_SEED_LENGTH, undefined, {
      received: len,
      expected: '32 or 4'
    });
  }
}

/**
 * Validates an NFC Tag UID.
 * A valid UID is a hex string (optional colons).
 * Enforces standard NFC UID lengths: 4 bytes (8 hex chars), 7 bytes (14 hex chars), or 10 bytes (20 hex chars).
 *
 * @param uid The UID to validate.
 * @throws BoksProtocolError if the UID is invalid.
 */
export function validateNfcUid(uid: string): void {
  const cleanUid = uid.replace(/:/g, '');
  if (!/^[0-9A-F]+$/i.test(cleanUid)) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
      received: uid,
      reason: 'NOT_HEX'
    });
  }

  const length = cleanUid.length;
  // Length in hex chars: 8 (4 bytes), 14 (7 bytes), 20 (10 bytes)
  if (length !== 8 && length !== 14 && length !== 20) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT, undefined, {
      received: uid,
      reason: 'INVALID_LENGTH',
      expected: '4, 7, or 10 bytes'
    });
  }
}
