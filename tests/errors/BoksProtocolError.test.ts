import { describe, it, expect } from 'vitest';
import { BoksProtocolError, BoksProtocolErrorId } from '../../src/errors/BoksProtocolError';

describe('BoksProtocolError', () => {
  describe('BoksProtocolErrorId Enum', () => {
    it('should have the correct string values', () => {
      expect(BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH).toBe('INVALID_PAYLOAD_LENGTH');
      expect(BoksProtocolErrorId.INVALID_CONFIG_KEY).toBe('INVALID_CONFIG_KEY');
      expect(BoksProtocolErrorId.INVALID_VALUE).toBe('INVALID_VALUE');
      expect(BoksProtocolErrorId.MALFORMED_DATA).toBe('MALFORMED_DATA');
      expect(BoksProtocolErrorId.INVALID_PIN_FORMAT).toBe('INVALID_PIN_FORMAT');
      expect(BoksProtocolErrorId.INVALID_INDEX_RANGE).toBe('INVALID_INDEX_RANGE');
      expect(BoksProtocolErrorId.INVALID_SEED_LENGTH).toBe('INVALID_SEED_LENGTH');
      expect(BoksProtocolErrorId.INVALID_NFC_UID_FORMAT).toBe('INVALID_NFC_UID_FORMAT');
    });
  });

  describe('Constructor Instantiation', () => {
    const testCases = [
      {
        description: 'only id',
        id: BoksProtocolErrorId.INVALID_VALUE,
        message: undefined,
        context: undefined,
        expectedMessage: 'INVALID_VALUE'
      },
      {
        description: 'id and custom message',
        id: BoksProtocolErrorId.MALFORMED_DATA,
        message: 'Data is missing required fields',
        context: undefined,
        expectedMessage: 'Data is missing required fields'
      },
      {
        description: 'id, custom message, and context',
        id: BoksProtocolErrorId.INVALID_PIN_FORMAT,
        message: 'Invalid prefix',
        context: { prefix: 'unknown-prefix', bufferSize: 10 },
        expectedMessage: 'Invalid prefix'
      },
      {
        description: 'id and context (no message)',
        id: BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        message: undefined,
        context: { expected: 16, actual: 12 },
        expectedMessage: 'INVALID_PAYLOAD_LENGTH'
      }
    ];

    it.each(testCases)(
      'should correctly instantiate with $description',
      ({ id, message, context, expectedMessage }) => {
        const error = new BoksProtocolError(id, message, context);

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('BoksProtocolError');
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
