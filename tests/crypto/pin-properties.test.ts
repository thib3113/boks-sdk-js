import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateBoksPin } from '../../src/crypto/pin-algorithm';

describe('PIN Algorithm - Property Based Testing', () => {
  
  // Invariant 1: Le résultat fait toujours 6 caractères
  it('should always return a 6-character string', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 32, maxLength: 32 }), // Clé de 32 octets
        fc.constantFrom('single-use', 'multi-use', 'master'), // Préfixe valide uniquement
        fc.nat(),                                        // Index positif
        (key, prefix, index) => {
          const pin = generateBoksPin(key, prefix, index);
          return pin.length === 6;
        }
      ),
      { numRuns: 10000 } // On teste 10 000 combinaisons aléatoires
    );
  });

  // Invariant 2: Le résultat n'utilise que l'alphabet Boks (0-9AB)
  it('should only use Boks authorized characters (0-9AB)', () => {
    const BOKS_CHARS = /^[0-9AB]{6}$/;
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 32, maxLength: 32 }),
        fc.constantFrom('single-use', 'multi-use', 'master'),
        fc.nat(),
        (key, prefix, index) => {
          const pin = generateBoksPin(key, prefix, index);
          return BOKS_CHARS.test(pin);
        }
      ),
      { numRuns: 10000 }
    );
  });

  // Invariant 3: Déterminisme (Mêmes entrées -> Même sortie)
  it('should be deterministic', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 32, maxLength: 32 }),
        fc.constantFrom('single-use', 'multi-use', 'master'),
        fc.nat(),
        (key, prefix, index) => {
          const pin1 = generateBoksPin(key, prefix, index);
          const pin2 = generateBoksPin(key, prefix, index);
          return pin1 === pin2;
        }
      ),
      { numRuns: 5000 }
    );
  });

  // Invariant 4: Non-mutation de la clé d'entrée
  it('should never modify the input key buffer', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 32, maxLength: 32 }),
        fc.constantFrom('single-use', 'multi-use', 'master'),
        fc.nat(),
        (key, prefix, index) => {
          const originalKey = new Uint8Array(key);
          generateBoksPin(key, prefix, index);
          // On vérifie que key est resté identique à originalKey
          for (let i = 0; i < key.length; i++) {
            if (key[i] !== originalKey[i]) return false;
          }
          return true;
        }
      )
    );
  });

  // Invariant 5: Indépendance des appels (Pas de pollution par les buffers partagés)
  it('should yield the same result regardless of previous calls', () => {
    const key1 = new Uint8Array(32).fill(0x11);
    const key2 = new Uint8Array(32).fill(0x22);
    
    // Calcul de référence
    const ref1 = generateBoksPin(key1, 'single-use', 1);
    const ref2 = generateBoksPin(key2, 'single-use', 2);

    // On alterne les appels massivement
    for (let i = 0; i < 1000; i++) {
        // Use try-catch for junk calls as they are expected to fail now
        try { generateBoksPin(key1, 'junk', i); } catch {}

        const check2 = generateBoksPin(key2, 'single-use', 2);
        expect(check2).toBe(ref2);

        try { generateBoksPin(key2, 'junk', i); } catch {}

        const check1 = generateBoksPin(key1, 'single-use', 1);
        expect(check1).toBe(ref1);
    }
  });

  // Invariant 6: Sensibilité aux changements (Avalanche Effect léger)
  it('should change the PIN if a single bit of the key changes', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 32, maxLength: 32 }),
        fc.constantFrom('single-use', 'multi-use', 'master'),
        fc.nat(),
        fc.integer({ min: 0, max: 31 }), // Octet à modifier
        (key, prefix, index, byteToFlip) => {
          const pin1 = generateBoksPin(key, prefix, index);
          
          const key2 = new Uint8Array(key);
          key2[byteToFlip] ^= 0x01; // On change 1 bit
          
          const pin2 = generateBoksPin(key2, prefix, index);
          
          return pin1 !== pin2; // On s'attend à ce que le PIN change (très haute probabilité)
        }
      ),
      { numRuns: 5000 }
    );
  });
});
