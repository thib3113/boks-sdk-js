/**
 * Boks PIN Algorithm (BLAKE2s)
 */

import { PIN_ALGO_CONFIG } from '../protocol/constants';
import { BoksProtocolError, BoksProtocolErrorId } from '../errors/BoksProtocolError';
import { BoksExpectedReason } from '../errors/BoksExpectedReason';

const encoder = new TextEncoder();
const BOKS_CHAR_MAP = '0123456789AB';

// Optimization: Precompute 16-bit lookup table (2 chars) for faster PIN extraction.
const PIN_LOOKUP_16BIT = new Array<string>(65536);
for (let i = 0; i < 65536; i++) {
  PIN_LOOKUP_16BIT[i] = BOKS_CHAR_MAP[(i & 255) % 12] + BOKS_CHAR_MAP[((i >>> 8) & 255) % 12];
}

const ALLOWED_PREFIXES = ['single-use', 'multi-use', 'master'] as const;
type AllowedPrefix = (typeof ALLOWED_PREFIXES)[number];

const PREFIX_BYTES = ALLOWED_PREFIXES.reduce(
  (acc, prefix) => {
    acc[prefix] = encoder.encode(prefix);
    return acc;
  },
  {} as Record<AllowedPrefix, Uint8Array>
);

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

const compress = (
  h: Uint32Array,
  block32: Uint32Array,
  t0: number,
  f0: number,
  v: Uint32Array
): Uint32Array => {
  v.set(h, 0);
  v.set(PIN_ALGO_CONFIG.IV, 8);
  v[12] ^= t0;
  v[14] ^= f0;

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

const validateParams = (index: number, typePrefix: string) => {
  if (index < 0 || !Number.isInteger(index)) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid index: must be a non-negative integer, got ${index}`,
      { received: index, field: 'index', expected: BoksExpectedReason.POSITIVE_INTEGER }
    );
  }
  if (!ALLOWED_PREFIXES.includes(typePrefix as AllowedPrefix)) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid PIN type prefix: "${typePrefix}". Allowed: ${ALLOWED_PREFIXES.join(', ')}`,
      { received: typePrefix, allowed: ALLOWED_PREFIXES, expected: ALLOWED_PREFIXES.join(', ') }
    );
  }
};

/**
 * Shared internal logic for processing the message block and extracting PIN.
 * @internal
 */
const processMessageBlock = (h: Uint32Array, typePrefix: string, index: number): string => {
  const blockBuffer = SHARED_BLOCK_BUFFER;
  const block32 = SHARED_BLOCK32;
  const v = SHARED_V;

  blockBuffer.fill(0);
  let offset = 0;

  const prefixBytes = PREFIX_BYTES[typePrefix as AllowedPrefix];
  blockBuffer.set(prefixBytes, 0);
  offset += prefixBytes.length;

  blockBuffer[offset++] = 32; // space

  if (index === 0) {
    blockBuffer[offset++] = 48; // '0'
  } else {
    const indexStr = '' + index;
    const digits = indexStr.length;

    // Safety check: ensure we don't overflow the buffer
    if (offset + digits > blockBuffer.length) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_VALUE,
        `Message too long: ${offset + digits} bytes`,
        {
          received: offset + digits,
          limit: blockBuffer.length,
          expected: blockBuffer.length,
          reason: 'MESSAGE_TOO_LONG'
        }
      );
    }

    for (let i = 0; i < digits; i++) {
      blockBuffer[offset++] = indexStr.charCodeAt(i);
    }
  }

  compress(h, block32, 64 + offset, PIN_ALGO_CONFIG.MAX_32, v);

  const w0 = h[0];
  const w1 = h[1];

  return (
    PIN_LOOKUP_16BIT[w0 & 65535] +
    PIN_LOOKUP_16BIT[(w0 >>> 16) & 65535] +
    PIN_LOOKUP_16BIT[w1 & 65535]
  );
};

/**
 * Precomputes the intermediate hash state after processing the key block.
 */
export const precomputeBoksKeyContext = (key: Uint8Array): Uint32Array => {
  if (key.length !== 32) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid key length: expected 32 bytes, got ${key.length}`,
      { received: key.length, expected: 32, field: 'key' }
    );
  }

  const h = SHARED_H;
  const blockBuffer = SHARED_BLOCK_BUFFER;
  const block32 = SHARED_BLOCK32;
  const v = SHARED_V;

  try {
    h.set(PIN_ALGO_CONFIG.IV);
    h[0] ^= PIN_ALGO_CONFIG.CONST_1;
    blockBuffer.fill(0);
    blockBuffer.set(key);
    compress(h, block32, 64, 0, v);
    return new Uint32Array(h);
  } finally {
    // Note: don't wipe SHARED_H here as we return a copy, 
    // but we wipe temporary calculation buffers
    blockBuffer.fill(0);
    v.fill(0);
  }
};

/**
 * Generates a Boks PIN using a precomputed key context.
 */
export const generateBoksPinFromContext = (
  keyContext: Uint32Array,
  typePrefix: string,
  index: number
): string => {
  if (keyContext.length !== 8) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      `Invalid key context length: expected 8 words, got ${keyContext.length}`,
      { received: keyContext.length, expected: 8, field: 'keyContext' }
    );
  }
  validateParams(index, typePrefix);
  const h = SHARED_H;
  try {
    h.set(keyContext);
    return processMessageBlock(h, typePrefix, index);
  } finally {
    h.fill(0);
    SHARED_V.fill(0);
  }
};

/**
 * Generates a Boks PIN from a master key.
 */
export const generateBoksPin = (key: Uint8Array, typePrefix: string, index: number): string => {
  // Reuse precompute logic to avoid duplication
  const context = precomputeBoksKeyContext(key);
  const pin = generateBoksPinFromContext(context, typePrefix, index);
  // Security: Wipe context immediately
  context.fill(0);
  return pin;
};
