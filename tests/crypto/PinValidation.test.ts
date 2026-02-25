import { describe, it, expect } from 'vitest';
import { generateBoksPin } from '../../src/crypto/pin-algorithm';
import { BoksProtocolError } from '../../src/errors/BoksProtocolError';

describe('Boks Pin Algorithm Security Validation', () => {
  const masterKey = new Uint8Array(32).fill(0xAA);

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
});
