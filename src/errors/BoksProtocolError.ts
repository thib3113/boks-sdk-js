export enum BoksProtocolErrorId {
  INVALID_PAYLOAD_LENGTH = 'INVALID_PAYLOAD_LENGTH',
  INVALID_CONFIG_KEY = 'INVALID_CONFIG_KEY',
  INVALID_VALUE = 'INVALID_VALUE',
  MALFORMED_DATA = 'MALFORMED_DATA',
  INVALID_PIN_FORMAT = 'INVALID_PIN_FORMAT',
  INVALID_INDEX_RANGE = 'INVALID_INDEX_RANGE',
  INVALID_SEED_LENGTH = 'INVALID_SEED_LENGTH',
  INVALID_NFC_UID_FORMAT = 'INVALID_NFC_UID_FORMAT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CHECKSUM_MISMATCH = 'CHECKSUM_MISMATCH',
  INVALID_TYPE = 'INVALID_TYPE',
  MISSING_MANDATORY_FIELD = 'MISSING_MANDATORY_FIELD',
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',
  BUFFER_OVERFLOW = 'BUFFER_OVERFLOW'
}

/**
 * Custom error for Boks Protocol (parsing, encoding, validation).
 */
export class BoksProtocolError extends Error {
  constructor(
    public readonly id: BoksProtocolErrorId,
    message?: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message || id);
    this.name = 'BoksProtocolError';
  }
}
