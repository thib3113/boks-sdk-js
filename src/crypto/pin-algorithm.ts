/**
 * Boks PIN Algorithm (Modified BLAKE2s with SHA-256 IV)
 */

import { PIN_ALGO_CONFIG } from '../protocol/constants';
import { BoksProtocolError, BoksProtocolErrorId } from '../errors/BoksProtocolError';

const encoder = new TextEncoder();
const BOKS_CHAR_MAP = '0123456789AB';

// Whitelist of allowed prefixes for PIN generation to prevent misuse and buffer overflows.
// These are the only prefixes defined in the Boks protocol.
const ALLOWED_PREFIXES = ['single-use', 'multi-use', 'master'] as const;
type AllowedPrefix = (typeof ALLOWED_PREFIXES)[number];

// Optimization: Precomputed UTF-8 bytes for allowed prefixes
// This avoids calling TextEncoder.encodeInto repeatedly for the static parts of the message.
const PREFIX_BYTES = ALLOWED_PREFIXES.reduce(
  (acc, prefix) => {
    acc[prefix] = encoder.encode(prefix);
    return acc;
  },
  {} as Record<AllowedPrefix, Uint8Array>
);

// Optimization: Shared buffers to avoid allocation on every call.
// This is safe in single-threaded environments (Browser/Node main thread).
// We rely on the try-finally block to wipe these buffers after use.
const SHARED_H = new Uint32Array(8);
const SHARED_BLOCK_BUFFER = new Uint8Array(64);
const SHARED_BLOCK32 = new Uint32Array(SHARED_BLOCK_BUFFER.buffer);
const SHARED_V = new Uint32Array(16);

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

/**
 * Shared internal logic for processing the message block and extracting PIN.
 * Assumes h contains the state after the Key block processing.
 *
 * @internal
 */
const processMessageBlock = (h: Uint32Array, typePrefix: string, index: number): string => {
  const blockBuffer = SHARED_BLOCK_BUFFER;
  const block32 = SHARED_BLOCK32;
  const v = SHARED_V;

  // Block 2: The Message (prefix + " " + index)
  // Optimization: Write parts directly to buffer to avoid string concatenation `${typePrefix} ${index}`
  // which allocates a new string.

  // Clear buffer for next block
  blockBuffer.fill(0);

  let offset = 0;

  // Optimization: Use precomputed bytes instead of TextEncoder
  // This avoids UTF-8 encoding overhead for known static prefixes.
  const prefixBytes = PREFIX_BYTES[typePrefix as AllowedPrefix];
  blockBuffer.set(prefixBytes, 0);
  offset += prefixBytes.length;

  // Write space ' '
  blockBuffer[offset++] = 32;

  // Write index
  const idxStr = index.toString();

  // Safety check: ensure we don't overflow the buffer (though unlikely with standard indices)
  if (offset + idxStr.length > blockBuffer.length) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Message too long: ${offset + idxStr.length} bytes`,
      {
        received: offset + idxStr.length,
        limit: blockBuffer.length,
        reason: 'MESSAGE_TOO_LONG'
      }
    );
  }

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

/**
 * Precomputes the intermediate hash state after processing the key block.
 * This state can be reused to generate multiple PINs with the same key.
 */
export const precomputeBoksKeyContext = (key: Uint8Array): Uint32Array => {
  // Input Validation
  if (key.length !== 32) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid key length: expected 32 bytes, got ${key.length}`,
      {
        received: key.length,
        expected: 32,
        field: 'key'
      }
    );
  }

  const h = SHARED_H;
  const blockBuffer = SHARED_BLOCK_BUFFER;
  const block32 = SHARED_BLOCK32;
  const v = SHARED_V;

  try {
    // Reset h with IV
    h.set(PIN_ALGO_CONFIG.IV);
    h[0] ^= PIN_ALGO_CONFIG.CONST_1;

    // Block 1: The Key (padded to 64 bytes)
    // We must clear blockBuffer first because we reuse it
    blockBuffer.fill(0);
    blockBuffer.set(key); // Assumes key.length <= 64
    compress(h, block32, 64, 0, v);

    // Return a copy of h
    return new Uint32Array(h);
  } finally {
    // Security: Wipe the buffer containing the key/intermediate state
    blockBuffer.fill(0);
    h.fill(0);
    v.fill(0);
    block32.fill(0);
  }
};

/**
 * Generates a Boks PIN using a precomputed key context.
 * This skips the key block processing and is significantly faster for bulk generation.
 */
export const generateBoksPinFromContext = (
  keyContext: Uint32Array,
  typePrefix: string,
  index: number
): string => {
  // Input Validation
  if (keyContext.length !== 8) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid key context length: expected 8 words, got ${keyContext.length}`,
      {
        received: keyContext.length,
        expected: 8,
        field: 'keyContext'
      }
    );
  }
  if (index < 0 || !Number.isInteger(index)) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid index: must be a non-negative integer, got ${index}`,
      {
        received: index,
        field: 'index'
      }
    );
  }
  if (!ALLOWED_PREFIXES.includes(typePrefix as AllowedPrefix)) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid PIN type prefix: "${typePrefix}". Allowed: ${ALLOWED_PREFIXES.join(', ')}`,
      {
        received: typePrefix,
        allowed: ALLOWED_PREFIXES,
        reason: 'INVALID_PREFIX'
      }
    );
  }

  const h = SHARED_H;
  const blockBuffer = SHARED_BLOCK_BUFFER;
  const block32 = SHARED_BLOCK32;
  const v = SHARED_V;

  try {
    // Restore h from context
    h.set(keyContext);
    return processMessageBlock(h, typePrefix, index);
  } finally {
    // Security: Wipe the buffer containing the key/intermediate state
    blockBuffer.fill(0);
    h.fill(0);
    v.fill(0);
    block32.fill(0);
  }
};

export const generateBoksPin = (key: Uint8Array, typePrefix: string, index: number): string => {
  // Input Validation
  if (key.length !== 32) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid key length: expected 32 bytes, got ${key.length}`,
      {
        received: key.length,
        expected: 32,
        field: 'key'
      }
    );
  }
  if (index < 0 || !Number.isInteger(index)) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid index: must be a non-negative integer, got ${index}`,
      {
        received: index,
        field: 'index'
      }
    );
  }

  if (!ALLOWED_PREFIXES.includes(typePrefix as AllowedPrefix)) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid PIN type prefix: "${typePrefix}". Allowed: ${ALLOWED_PREFIXES.join(', ')}`,
      {
        received: typePrefix,
        allowed: ALLOWED_PREFIXES,
        reason: 'INVALID_PREFIX'
      }
    );
  }

  // Use shared buffers
  const h = SHARED_H;
  const blockBuffer = SHARED_BLOCK_BUFFER;
  const block32 = SHARED_BLOCK32;
  const v = SHARED_V;

  try {
    // Reset h with IV
    h.set(PIN_ALGO_CONFIG.IV);
    h[0] ^= PIN_ALGO_CONFIG.CONST_1;

    // Block 1: The Key (padded to 64 bytes)
    // We must clear blockBuffer first because we reuse it
    blockBuffer.fill(0);
    blockBuffer.set(key); // Assumes key.length <= 64
    compress(h, block32, 64, 0, v);

    return processMessageBlock(h, typePrefix, index);
  } finally {
    // Security: Wipe the buffer containing the key/intermediate state
    blockBuffer.fill(0);
    h.fill(0);
    v.fill(0);
    block32.fill(0);
  }
};
