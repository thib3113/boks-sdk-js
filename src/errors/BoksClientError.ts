export enum BoksClientErrorId {
  WEB_BLUETOOTH_NOT_SUPPORTED = 'WEB_BLUETOOTH_NOT_SUPPORTED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTION_FAILED = 'CONNECTION_FAILURE',
  DISCONNECT_FAILED = 'DISCONNECT_FAILURE',
  WRITE_FAILED = 'WRITE_FAILURE',
  SUBSCRIBE_FAILED = 'SUBSCRIBE_FAILURE',
  TIMEOUT = 'TIMEOUT',
  PARSE_ERROR = 'PARSE_ERROR',
  NO_TRANSPORT = 'NO_TRANSPORT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  ALREADY_EXISTS = 'ALREADY_EXISTS'
}

/**
 * Custom error for Boks Client operations.
 */
export class BoksClientError extends Error {
  constructor(
    public readonly id: BoksClientErrorId,
    message?: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message || id);
    this.name = 'BoksClientError';
  }
}
