import { describe, it, expect } from 'vitest';
import { BoksClientError, BoksClientErrorId } from '../../src/errors/BoksClientError';

describe('BoksClientError', () => {
  describe('BoksClientErrorId Enum', () => {
    it('should have the correct string values', () => {
      expect(BoksClientErrorId.WEB_BLUETOOTH_NOT_SUPPORTED).toBe('WEB_BLUETOOTH_NOT_SUPPORTED');
      expect(BoksClientErrorId.NOT_CONNECTED).toBe('NOT_CONNECTED');
      expect(BoksClientErrorId.CONNECTION_FAILED).toBe('CONNECTION_FAILURE');
      expect(BoksClientErrorId.DISCONNECT_FAILED).toBe('DISCONNECT_FAILURE');
      expect(BoksClientErrorId.WRITE_FAILED).toBe('WRITE_FAILURE');
      expect(BoksClientErrorId.SUBSCRIBE_FAILED).toBe('SUBSCRIBE_FAILURE');
      expect(BoksClientErrorId.TIMEOUT).toBe('TIMEOUT');
      expect(BoksClientErrorId.PARSE_ERROR).toBe('PARSE_ERROR');
      expect(BoksClientErrorId.NO_TRANSPORT).toBe('NO_TRANSPORT');
      expect(BoksClientErrorId.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
      expect(BoksClientErrorId.UNSUPPORTED_FEATURE).toBe('UNSUPPORTED_FEATURE');
      expect(BoksClientErrorId.INVALID_PARAMETER).toBe('INVALID_PARAMETER');
      expect(BoksClientErrorId.ALREADY_EXISTS).toBe('ALREADY_EXISTS');
      expect(BoksClientErrorId.RATE_LIMIT_REACHED).toBe('RATE_LIMIT_REACHED');
    });
  });

  describe('Constructor Instantiation', () => {
    const testCases = [
      {
        description: 'only id',
        id: BoksClientErrorId.NOT_CONNECTED,
        message: undefined,
        context: undefined,
        expectedMessage: 'NOT_CONNECTED'
      },
      {
        description: 'id and custom message',
        id: BoksClientErrorId.TIMEOUT,
        message: 'Operation timed out after 5000ms',
        context: undefined,
        expectedMessage: 'Operation timed out after 5000ms'
      },
      {
        description: 'id, custom message, and context',
        id: BoksClientErrorId.WRITE_FAILED,
        message: 'Failed to write characteristic',
        context: { opcode: 0x02, deviceId: 'unknown' },
        expectedMessage: 'Failed to write characteristic'
      },
      {
        description: 'id and context (no message)',
        id: BoksClientErrorId.RATE_LIMIT_REACHED,
        message: undefined,
        context: { retryAfter: 1000 },
        expectedMessage: 'RATE_LIMIT_REACHED'
      }
    ];

    it.each(testCases)(
      'should correctly instantiate with $description',
      ({ id, message, context, expectedMessage }) => {
        const error = new BoksClientError(id, message, context);

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('BoksClientError');
        expect(error.id).toBe(id);
        expect(error.message).toBe(expectedMessage);

        if (context) {
          expect(error.context).toEqual(context);
        } else {
          expect(error.context).toBeUndefined();
        }
      }
    );
  });
});
