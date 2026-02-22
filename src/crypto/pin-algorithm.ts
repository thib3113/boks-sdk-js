/**
 * Boks PIN Algorithm (Modified BLAKE2s with SHA-256 IV)
 */

import { PIN_ALGO_CONFIG } from '../protocol/constants';

// Shared buffers to avoid allocation on every call
// Note: This makes the function non-reentrant. It is safe in single-threaded JS/Node environments
// as long as generateBoksPin is not called recursively or concurrently (e.g. while yielding).
// Since generateBoksPin is synchronous, this is safe.
const h = new Uint32Array(8);
const blockBuffer = new Uint8Array(64);
const block32 = new Uint32Array(blockBuffer.buffer);
const v = new Uint32Array(16);
const encoder = new TextEncoder();
const BOKS_CHAR_MAP = '0123456789AB';

const G = (v: Uint32Array, a: number, b: number, c: number, d: number, x: number, y: number) => {
  v[a] = (v[a] + v[b] + x) >>> 0;
  const tmpD = v[d] ^ v[a];
  v[d] = ((tmpD >>> 16) | (tmpD << 16)) >>> 0;
  v[c] = (v[c] + v[d]) >>> 0;
  const tmpB = v[b] ^ v[c];
  v[b] = ((tmpB >>> 12) | (tmpB << 20)) >>> 0;
  v[a] = (v[a] + v[b] + y) >>> 0;
  const tmpD2 = v[d] ^ v[a];
  v[d] = ((tmpD2 >>> 8) | (tmpD2 << 24)) >>> 0;
  v[c] = (v[c] + v[d]) >>> 0;
  const tmpB2 = v[b] ^ v[c];
  v[b] = ((tmpB2 >>> 7) | (tmpB2 << 25)) >>> 0;
};

// Optimization: Reuse Uint32Array view if possible
const compress = (
  h: Uint32Array,
  block32: Uint32Array,
  t0: number,
  f0: number,
  v: Uint32Array
): Uint32Array => {
  // Initialize v
  v.set(h, 0);
  v.set(PIN_ALGO_CONFIG.IV, 8);
  v[12] ^= t0;
  v[14] ^= f0;

  // No allocation for m needed, use block32 directly
  // Note: This assumes Little-Endian architecture.
  // In a cross-platform safe implementation we would check endianness,
  // but for high-perf Boks SDK (Node/Browser) we assume LE.
  const m = block32;

  for (let i = 0; i < 10; i++) {
    const s = PIN_ALGO_CONFIG.SIGMA[i];
    G(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
    G(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
    G(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
    G(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
    G(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
    G(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
    G(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
    G(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
  }

  for (let i = 0; i < 8; i++) {
    h[i] ^= v[i] ^ v[i + 8];
  }
  return h;
};

export const generateBoksPin = (key: Uint8Array, typePrefix: string, index: number): string => {
  // Reset h with IV
  h.set(PIN_ALGO_CONFIG.IV);
  h[0] ^= PIN_ALGO_CONFIG.CONST_1;

  // Block 1: The Key (padded to 64 bytes)
  // We must clear blockBuffer first because we reuse it
  blockBuffer.fill(0);
  blockBuffer.set(key); // Assumes key.length <= 64
  compress(h, block32, 64, 0, v);

  // Block 2: The Message (prefix + " " + index)
  // Optimization: Write parts directly to buffer to avoid string concatenation `${typePrefix} ${index}`
  // which allocates a new string.

  // Clear buffer for next block
  blockBuffer.fill(0);

  let offset = 0;

  // Write typePrefix
  const r1 = encoder.encodeInto(typePrefix, blockBuffer);
  offset += r1.written!;

  // Write space ' '
  blockBuffer[offset++] = 32;

  // Write index
  const idxStr = index.toString();
  // Use subarray to write at offset without copying buffer
  const r2 = encoder.encodeInto(idxStr, blockBuffer.subarray(offset));
  offset += r2.written!;

  compress(h, block32, 64 + offset, PIN_ALGO_CONFIG.MAX_32, v);

  // Result: First 6 bytes of the hash, mapped to Boks Chars
  // Need to extract 6 bytes from h (which is 8x32bit words)
  // The Python ref uses struct.pack('<I', x) for each word then takes [:6]

  let pin = '';
  // Optimization: Unrolled loop to avoid temporary array allocation
  // Word 0 (bytes 0, 1, 2, 3)
  const w0 = h[0];
  pin += BOKS_CHAR_MAP[(w0 & 255) % 12];
  pin += BOKS_CHAR_MAP[((w0 >>> 8) & 255) % 12];
  pin += BOKS_CHAR_MAP[((w0 >>> 16) & 255) % 12];
  pin += BOKS_CHAR_MAP[((w0 >>> 24) & 255) % 12];

  // Word 1 (bytes 4, 5)
  const w1 = h[1];
  pin += BOKS_CHAR_MAP[(w1 & 255) % 12];
  pin += BOKS_CHAR_MAP[((w1 >>> 8) & 255) % 12];

  return pin;
};
