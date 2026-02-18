import { describe, it, expect } from 'vitest';
import { generateBoksPin } from '@/crypto/pin-algorithm';

describe('Boks PIN Algorithm', () => {
  it('should generate a consistent PIN from a master key', () => {
    // This is a placeholder test. In a real scenario, we would use
    // a known Master Key and its corresponding PIN from the Boks app.
    // Assuming we have a 32-byte key (all zeros for test stability)
    const key = new Uint8Array(32).fill(0xaa);
    const pin = generateBoksPin(key, 'master', 0);

    expect(pin).toHaveLength(6);
    expect(typeof pin).toBe('string');
    // Regex for 0-9AB
    expect(pin).toMatch(/^[0-9AB]{6}$/);
  });

  it('should generate different PINs for different indices', () => {
    const key = new Uint8Array(32).fill(0xBB);
    const pin0 = generateBoksPin(key, 'single-use', 0);
    const pin1 = generateBoksPin(key, 'single-use', 1);
    
    expect(pin0).not.toBe(pin1);
  });
});
