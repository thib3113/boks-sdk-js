export enum BoksProtocolErrorId {
  INVALID_PAYLOAD_LENGTH = 'INVALID_PAYLOAD_LENGTH',
  INVALID_CONFIG_KEY = 'INVALID_CONFIG_KEY',
  INVALID_VALUE = 'INVALID_VALUE',
  MALFORMED_DATA = 'MALFORMED_DATA'
}

/**
 * Custom error for Boks Protocol (parsing, encoding, validation).
 */
export class BoksProtocolError extends Error {
  constructor(
    public readonly id: BoksProtocolErrorId,
    message: string,
    public readonly context?: unknown
  ) {
    super(message);
    this.name = 'BoksProtocolError';
  }
}
