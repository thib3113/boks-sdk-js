import { describe, it, expect } from 'vitest';
import { generateBoksPin } from '@/crypto/pin-algorithm';

describe('Boks PIN Algorithm Stress Tests', () => {
  // 1. Golden Master / Regression Test
  it('should match known test vectors (Regression)', () => {
    const vectors = [
      {
        key: new Uint8Array(32).fill(0xaa),
        typePrefix: 'master',
        index: 12345,
        expected: '615BB5'
      },
      {
        key: new Uint8Array(32).fill(0x00),
        typePrefix: 'single',
        index: 0,
        expected: '64006B'
      },
      {
        key: new Uint8Array(32).fill(0xff),
        typePrefix: 'multi',
        index: 999999,
        expected: '2A393B'
      }
    ];

    vectors.forEach(({ key, typePrefix, index, expected }) => {
      expect(generateBoksPin(key, typePrefix, index)).toBe(expected);
    });
  });

  // 2. Consistency / Determinism Test
  it('should be deterministic over many iterations', () => {
    const iterations = 10000;
    const key = new Uint8Array(32).fill(0x12);

    for (let i = 0; i < iterations; i++) {
      // Random-ish inputs
      const index = Math.floor(Math.random() * 100000);
      const type = i % 2 === 0 ? 'master' : 'single';

      const pin1 = generateBoksPin(key, type, index);
      const pin2 = generateBoksPin(key, type, index);

      expect(pin1).toBe(pin2);
      expect(pin1).toMatch(/^[0-9AB]{6}$/);
    }
  });

  // 3. State Isolation Test (Shared Buffer Safety)
  it('should not leak state between calls with different keys', () => {
    const keyA = new Uint8Array(32).fill(0xaa);
    const keyB = new Uint8Array(32).fill(0xbb);

    const pinA_first = generateBoksPin(keyA, 'master', 1);
    const pinB_first = generateBoksPin(keyB, 'master', 1);
    const pinA_second = generateBoksPin(keyA, 'master', 1);

    expect(pinA_first).toBe(pinA_second);
    expect(pinA_first).not.toBe(pinB_first);
  });

  // 4. Heavy Load / Stability
  it('should handle rapid sequential calls without error', () => {
    const start = performance.now();
    const key = new Uint8Array(32).fill(0xcc);
    let checksum = 0;

    // Run 50,000 iterations
    for (let i = 0; i < 50000; i++) {
      const pin = generateBoksPin(key, 'test', i);
      // Simple checksum to ensure the compiler doesn't optimize away the loop
      checksum += pin.charCodeAt(0);
    }

    const end = performance.now();
    console.log(`Stress test (50k iterations) duration: ${(end - start).toFixed(2)}ms`);
    expect(checksum).toBeGreaterThan(0);
  });
});
