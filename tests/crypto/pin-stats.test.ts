import { describe, it, expect } from 'vitest';
import { generateBoksPin } from '../../src/crypto/pin-algorithm';

describe('PIN Algorithm - Statistical Sanity Check', () => {
  const TEST_KEY = new Uint8Array(32).fill(0xAA);
  const NUM_SAMPLES = 10000;

  it('should have a uniform character distribution', () => {
    const counts: Record<string, number> = {};
    const BOKS_CHARS = '0123456789AB';
    for (const char of BOKS_CHARS) counts[char] = 0;

    for (let i = 0; i < NUM_SAMPLES; i++) {
      const pin = generateBoksPin(TEST_KEY, 'single-use', i);
      for (const char of pin) {
        counts[char]++;
      }
    }

    const totalChars = NUM_SAMPLES * 6;
    const expectedPerChar = totalChars / 12;
    
    // On autorise une déviation de 10% par rapport à l'uniformité parfaite
    const tolerance = 0.10; 

    console.log("Character Distribution:");
    for (const char of BOKS_CHARS) {
      const frequency = counts[char] / totalChars;
      const deviation = Math.abs(counts[char] - expectedPerChar) / expectedPerChar;
      console.log(`  '${char}': ${counts[char]} instances (${(frequency * 100).toFixed(2)}%, dev: ${(deviation * 100).toFixed(2)}%)`);
      
      expect(deviation).toBeLessThan(tolerance);
    }
  });

  it('should have a low collision rate', () => {
    const seen = new Set<string>();
    let collisions = 0;

    for (let i = 0; i < NUM_SAMPLES; i++) {
      const pin = generateBoksPin(TEST_KEY, 'single-use', i);
      if (seen.has(pin)) {
        collisions++;
      }
      seen.add(pin);
    }

    const collisionRate = (collisions / NUM_SAMPLES) * 100;
    console.log(`Collisions found in ${NUM_SAMPLES} samples: ${collisions} (${collisionRate.toFixed(4)}%)`);

    // Probabilité théorique de collision (Paradoxe des anniversaires simplifié)
    // Pour 10 000 échantillons sur 2.9M de combinaisons, on s'attend à environ 16-20 collisions.
    // On met une limite large de 50 pour détecter un algorithme vraiment biaisé.
    expect(collisions).toBeLessThan(50);
  });
});
