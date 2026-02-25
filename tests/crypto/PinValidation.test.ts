import { describe, it, expect } from 'vitest';
import { generateBoksPin } from '../../src/crypto/pin-algorithm';
import { BoksProtocolError } from '../../src/errors/BoksProtocolError';

describe('Boks Pin Algorithm Security Validation', () => {
  const masterKey = new Uint8Array(32).fill(0xAA);

  it('should throw when prefix is too long (buffer overflow)', () => {
    // 65 chars prefix -> truncated to 64 in encodeInto, so r1.read (64) != typePrefix.length (65)
    // Should throw
    const longPrefix = 'A'.repeat(65);
    expect(() => generateBoksPin(masterKey, longPrefix, 0)).toThrow(BoksProtocolError);
    expect(() => generateBoksPin(masterKey, longPrefix, 0)).toThrowError(/Prefix too long/);
  });

  it('should throw when message exceeds buffer size (prefix fits but combined too long)', () => {
    // Prefix 63 chars. Fits. offset = 63.
    // Space (1 byte) -> offset = 64.
    // Index '0' (1 byte) -> offset = 65.
    // 63 + 1 + 1 = 65 > 64. Should throw.
    const borderPrefix = 'A'.repeat(63);
    expect(() => generateBoksPin(masterKey, borderPrefix, 0)).toThrow(BoksProtocolError);
    expect(() => generateBoksPin(masterKey, borderPrefix, 0)).toThrowError(/Message too long/);
  });

  it('should accept max length message', () => {
    // Prefix 62 chars. offset = 62.
    // Space (1 byte) -> offset = 63.
    // Index '0' (1 byte) -> offset = 64.
    // 62 + 1 + 1 = 64 <= 64. Should succeed.
    const maxPrefix = 'A'.repeat(62);
    expect(() => generateBoksPin(masterKey, maxPrefix, 0)).not.toThrow();
  });
});
