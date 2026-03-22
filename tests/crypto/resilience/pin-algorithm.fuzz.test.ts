import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import { generateBoksPin, precomputeBoksKeyContext, generateBoksPinFromContext } from '../../../src/crypto/pin-algorithm';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('PIN Algorithm Resilience (Fuzzing)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('FEATURE REGRESSION: generateBoksPin should safely handle arbitrary keys and inputs without native crashes', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        fc.string(),
        fc.oneof(fc.integer(), fc.double(), fc.float()),
        (key, prefix, index) => {
          try {
            generateBoksPin(key, prefix, index);
            // If it succeeds, the inputs must have strictly matched requirements
            expect(key.length).toBe(32);
            expect(['single-use', 'multi-use', 'master']).toContain(prefix);
            expect(Number.isInteger(index)).toBe(true);
            expect(index).toBeGreaterThanOrEqual(0);
          } catch (e) {
            // Must be a BoksProtocolError, not a native crash like TypeError
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: precomputeBoksKeyContext should safely reject invalid key lengths without crashing', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (key) => {
        try {
          const context = precomputeBoksKeyContext(key);
          expect(context).toBeInstanceOf(Uint32Array);
          expect(context.length).toBe(8);
          expect(key.length).toBe(32);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: generateBoksPinFromContext should safely reject invalid key contexts without crashing', () => {
    // Generate valid and invalid context arrays
    const contextArbitrary = fc.uint8Array({ minLength: 0, maxLength: 256 }).map(buf => new Uint32Array(buf.buffer, 0, Math.floor(buf.length / 4)));

    fc.assert(
      fc.property(
        contextArbitrary,
        fc.string(),
        fc.integer(),
        (context, prefix, index) => {
          try {
            generateBoksPinFromContext(context, prefix, index);

            expect(context.length).toBe(8);
            expect(['single-use', 'multi-use', 'master']).toContain(prefix);
            expect(index).toBeGreaterThanOrEqual(0);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: processMessageBlock (internal) should be safe against extremely large inputs causing buffer overflow', () => {
    // Fuzz processMessageBlock indirectly via generateBoksPin with enormous integers (represented safely)
    const VALID_KEY = new Uint8Array(32).fill(0xaa);

    fc.assert(
      fc.property(
        // Extremely large number
        fc.maxSafeInteger(),
        (hugeIndex) => {
          try {
            generateBoksPin(VALID_KEY, 'single-use', hugeIndex);
          } catch (e) {
             // In JS, numbers up to maxSafeInteger stringify to <= 21 chars.
             // Our block buffer is 64 bytes.
             // Prefix is ~10 bytes + 1 space + 21 digits = ~32 bytes.
             // It shouldn't overflow, so it should succeed.
             // If it does overflow, it throws BoksProtocolError (MESSAGE_TOO_LONG).
             expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });
});
