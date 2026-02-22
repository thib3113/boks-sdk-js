import { describe, it, expect } from 'vitest';
import { generateBoksPin } from '@/crypto/pin-algorithm';

describe('PIN Algorithm - Stress & Fuzzing', () => {
  const VALID_KEY = new Uint8Array(32).fill(0xAA);

  it('should throw error for invalid key sizes', () => {
    expect(() => generateBoksPin(new Uint8Array(16), 'master', 0)).toThrow('Invalid key length');
    expect(() => generateBoksPin(new Uint8Array(64), 'master', 0)).toThrow('Invalid key length');
  });

  it('should throw error for invalid indices', () => {
    expect(() => generateBoksPin(VALID_KEY, 'master', -1)).toThrow('Invalid index');
    expect(() => generateBoksPin(VALID_KEY, 'master', 1.5)).toThrow('Invalid index');
  });

  it('should pass stress test (10,000 sequential calls)', () => {
    const key = new Uint8Array(32).fill(0x42);
    const typePrefix = 'single-use';
    
    // We store the first one to compare with a later generation of the same index
    const firstPin = generateBoksPin(key, typePrefix, 0);
    
    for (let i = 0; i < 10000; i++) {
      const pin = generateBoksPin(key, typePrefix, i);
      
      // Basic format check on every iteration
      if (pin.length !== 6 || !/^[0-9AB]{6}$/.test(pin)) {
        throw new Error(`Integrity failure at index ${i}: ${pin}`);
      }
    }

    // Re-generate index 0 to ensure shared buffers were correctly reset
    const finalPin = generateBoksPin(key, typePrefix, 0);
    expect(finalPin).toBe(firstPin);
  });

  it('should pass fuzzing test (1,000 random keys)', () => {
    for (let i = 0; i < 1000; i++) {
      const randomKey = new Uint8Array(32);
      const crypto = require('node:crypto');
      crypto.randomFillSync(randomKey);
      
      const index = Math.floor(Math.random() * 3328);
      const pin = generateBoksPin(randomKey, 'single-use', index);
      
      expect(pin).toHaveLength(6);
      expect(pin).toMatch(/^[0-9AB]{6}$/);
    }
  });

  it('should be consistent across multiple runs with same random inputs', () => {
    const key = new Uint8Array(32);
    const crypto = require('node:crypto');
    crypto.randomFillSync(key);
    const type = 'single-use';
    const index = 123;

    const pin1 = generateBoksPin(key, type, index);
    const pin2 = generateBoksPin(key, type, index);
    
    expect(pin1).toBe(pin2);
  });

  it('should be safe when called "concurrently" via Promise.all', async () => {
    const key = new Uint8Array(32).fill(0xEE);
    const indices = Array.from({ length: 100 }, (_, i) => i);
    
    // Pre-calculate expected values synchronously
    const expected = indices.map(i => generateBoksPin(key, 'single-use', i));

    // Launch all via Promise.all (simulating concurrent async context)
    const results = await Promise.all(indices.map(async (i) => {
      // Small random delay before calling to mix things up in the event loop
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      return generateBoksPin(key, 'single-use', i);
    }));

    results.forEach((res, i) => {
      expect(res).toBe(expected[i]);
    });
  });
});
