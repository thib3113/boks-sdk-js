import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateBoksPin, precomputeBoksKeyContext, generateBoksPinFromContext } from '../../src/crypto/pin-algorithm';
import { BoksProtocolError, BoksProtocolErrorId } from '../../src/errors/BoksProtocolError';

describe('Boks Pin Algorithm Security Validation', () => {
  const masterKey = new Uint8Array(32).fill(0xAA);
  const validContext = new Uint32Array(8).fill(0x12345678);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateBoksPin validation', () => {
    it('should accept valid prefixes', () => {
      expect(() => generateBoksPin(masterKey, 'single-use', 0)).not.toThrow();
      expect(() => generateBoksPin(masterKey, 'multi-use', 0)).not.toThrow();
      expect(() => generateBoksPin(masterKey, 'master', 0)).not.toThrow();
    });

    it('should throw when prefix is unknown (security whitelist)', () => {
      const invalidPrefix = 'invalid-prefix';
      expect(() => generateBoksPin(masterKey, invalidPrefix, 0)).toThrow(BoksProtocolError);
      expect(() => generateBoksPin(masterKey, invalidPrefix, 0)).toThrowError(/Invalid PIN type prefix/);
    });

    it('should throw when prefix is excessively long (implicitly handled by whitelist)', () => {
      const longPrefix = 'A'.repeat(65);
      expect(() => generateBoksPin(masterKey, longPrefix, 0)).toThrow(BoksProtocolError);
      expect(() => generateBoksPin(masterKey, longPrefix, 0)).toThrowError(/Invalid PIN type prefix/);
    });

    it('should throw when key length is invalid', () => {
      const invalidKey = new Uint8Array(31).fill(0xAA);
      expect(() => generateBoksPin(invalidKey, 'single-use', 0)).toThrow(BoksProtocolError);
      expect(() => generateBoksPin(invalidKey, 'single-use', 0)).toThrowError(/Invalid key length: expected 32 bytes, got 31/);
    });

    it('should throw when index is invalid', () => {
      expect(() => generateBoksPin(masterKey, 'single-use', -1)).toThrow(BoksProtocolError);
      expect(() => generateBoksPin(masterKey, 'single-use', -1)).toThrowError(/Invalid index: must be a non-negative integer, got -1/);

      expect(() => generateBoksPin(masterKey, 'single-use', 1.5)).toThrow(BoksProtocolError);
      expect(() => generateBoksPin(masterKey, 'single-use', 1.5)).toThrowError(/Invalid index: must be a non-negative integer, got 1.5/);
    });
  });

  describe('precomputeBoksKeyContext validation', () => {
    it('should accept valid key', () => {
      expect(() => precomputeBoksKeyContext(masterKey)).not.toThrow();
    });

    it('should throw when key length is invalid', () => {
      const invalidKey = new Uint8Array(33).fill(0xAA);
      expect(() => precomputeBoksKeyContext(invalidKey)).toThrow(BoksProtocolError);
      expect(() => precomputeBoksKeyContext(invalidKey)).toThrowError(/Invalid key length: expected 32 bytes, got 33/);
    });
  });

  describe('generateBoksPinFromContext validation', () => {
    it('should accept valid inputs', () => {
      expect(() => generateBoksPinFromContext(validContext, 'single-use', 0)).not.toThrow();
    });

    it('should throw when context length is invalid', () => {
      const invalidContext = new Uint32Array(7).fill(0x12345678);
      expect(() => generateBoksPinFromContext(invalidContext, 'single-use', 0)).toThrow(BoksProtocolError);
      expect(() => generateBoksPinFromContext(invalidContext, 'single-use', 0)).toThrowError(/Invalid key context length: expected 8 words, got 7/);
    });

    it('should throw when index is invalid', () => {
      expect(() => generateBoksPinFromContext(validContext, 'single-use', -5)).toThrow(BoksProtocolError);
      expect(() => generateBoksPinFromContext(validContext, 'single-use', -5)).toThrowError(/Invalid index: must be a non-negative integer, got -5/);
    });

    it('should throw when prefix is invalid', () => {
      expect(() => generateBoksPinFromContext(validContext, 'invalid-prefix', 0)).toThrow(BoksProtocolError);
      expect(() => generateBoksPinFromContext(validContext, 'invalid-prefix', 0)).toThrowError(/Invalid PIN type prefix/);
    });
  });

  describe('processMessageBlock edge cases', () => {
    it('should loop successfully over string characters', () => {
      // By mocking Number.isInteger to return true for strings, we can pass a small string
      // into processMessageBlock, simulating the 'for' loop being covered.
      vi.spyOn(Number, 'isInteger').mockReturnValue(true);

      const smallString = '1';
      expect(() => generateBoksPin(masterKey, 'single-use', smallString as unknown as number)).not.toThrow();
    });

    it('should throw when message exceeds buffer length', () => {
      // By mocking Number.isInteger to return true for strings, we can pass a giant string
      // into processMessageBlock, simulating an overflow that generates the "Message too long" error.
      vi.spyOn(Number, 'isInteger').mockReturnValue(true);

      const longIndex = '1'.repeat(100);
      expect(() => generateBoksPin(masterKey, 'single-use', longIndex as unknown as number)).toThrow(BoksProtocolError);
      expect(() => generateBoksPin(masterKey, 'single-use', longIndex as unknown as number)).toThrowError(/Message too long:/);

      // Ensure the correct exact error structure is used
      try {
        generateBoksPin(masterKey, 'single-use', longIndex as unknown as number);
      } catch (e: any) {
        expect(e.id).toBe(BoksProtocolErrorId.INVALID_VALUE);
        expect(e.message).toContain('Message too long');
        expect(e.context?.reason).toBe('MESSAGE_TOO_LONG');
      }
    });
  });
});
