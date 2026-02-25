import { generateBoksPin } from './src/crypto/pin-algorithm';

const key = new Uint8Array(32).fill(0xAA);
const longPrefix = 'A'.repeat(70);

try {
  const pin = generateBoksPin(key, longPrefix, 0);
  console.log('PIN generated:', pin);
} catch (e) {
  console.error('Error:', e);
}
