export enum BoksProtocolErrorId {
  INVALID_PAYLOAD_LENGTH = 'INVALID_PAYLOAD_LENGTH',
  INVALID_CONFIG_KEY = 'INVALID_CONFIG_KEY',
  INVALID_VALUE = 'INVALID_VALUE',
  MALFORMED_DATA = 'MALFORMED_DATA',
  INVALID_PIN_FORMAT = 'INVALID_PIN_FORMAT',
  INVALID_INDEX_RANGE = 'INVALID_INDEX_RANGE',
  INVALID_SEED_LENGTH = 'INVALID_SEED_LENGTH',
  INVALID_NFC_UID_FORMAT = 'INVALID_NFC_UID_FORMAT'
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
