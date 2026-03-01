import { CHECKSUM_MASK } from '../protocol/constants';
import { BoksProtocolError, BoksProtocolErrorId } from '../errors/BoksProtocolError';

/**
 * Utility functions for Boks SDK
 */

// Optimization: Precompute hex lookup table to avoid expensive toString(16) calls
const HEX_TABLE = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0').toUpperCase()
);

// Optimization: Precompute 16-bit hex lookup table (4 chars) to process 2 bytes per iteration
const HEX_TABLE_16 = new Array<string>(65536);
for (let i = 0; i < 256; i++) {
  for (let j = 0; j < 256; j++) {
    HEX_TABLE_16[(i << 8) | j] = HEX_TABLE[i] + HEX_TABLE[j];
  }
}

// Optimization: Precompute hex decoding table to avoid parseInt calls
const HEX_DECODE_TABLE = new Uint8Array(256);
HEX_DECODE_TABLE.fill(255); // Invalid default

// '0'-'9'
for (let i = 0; i < 10; i++) {
  HEX_DECODE_TABLE[48 + i] = i;
}
// 'A'-'F'
for (let i = 0; i < 6; i++) {
  HEX_DECODE_TABLE[65 + i] = 10 + i;
}
// Lowercase hex is not supported per project requirements.
// Keys are always uppercase.

export const hexToBytes = (hex: string): Uint8Array => {
  const len = hex.length;
  // Optimization: fast path for clean hex strings (no spaces)
  // This avoids allocation of a new string via replace() for the common case.
  if ((len & 1) === 0) {
    const bytes = new Uint8Array(len >>> 1);
    let isClean = true;

    for (let i = 0, j = 0; i < len; i += 2, j++) {
      const high = HEX_DECODE_TABLE[hex.charCodeAt(i)];
      const low = HEX_DECODE_TABLE[hex.charCodeAt(i + 1)];

      if (high === 255 || high === undefined || low === 255 || low === undefined) {
        isClean = false;
        break;
      }
      bytes[j] = (high << 4) | low;
    }

    if (isClean) return bytes;
  }

  // Slow path: contains whitespace or invalid characters
  // We fall back to the original logic which handles whitespace stripping
  // and throws specific errors for invalid structure/chars.
  const cleanHex = hex.replace(/\s/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
      received: cleanHex.length,
      reason: 'ODD_LENGTH'
    });
  }
  const cleanLen = cleanHex.length;
  const bytes = new Uint8Array(cleanLen / 2);

  for (let i = 0; i < cleanLen; i += 2) {
    const high = HEX_DECODE_TABLE[cleanHex.charCodeAt(i)];
    const low = HEX_DECODE_TABLE[cleanHex.charCodeAt(i + 1)];

    if (high === undefined || low === undefined || high === 255 || low === 255) {
      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
        received: cleanHex[i] + (cleanHex[i + 1] || ''),
        reason: 'INVALID_HEX_CHAR'
      });
    }

    bytes[i / 2] = (high << 4) | low;
  }
  return bytes;
};

export const bytesToHex = (bytes: Uint8Array): string => {
  const len = bytes.length;
  let result = '';
  let i = 0;
  // Optimization: process 2 bytes at a time using a 16-bit lookup table
  // to halve the number of iterations and string concatenations.
  for (; i <= len - 2; i += 2) {
    result += HEX_TABLE_16[(bytes[i] << 8) | bytes[i + 1]];
  }
  // Handle remaining byte for odd lengths
  if (i < len) {
    result += HEX_TABLE[bytes[i]];
  }
  return result;
};

// Optimization: Cached to avoid instantiation overhead
const sharedEncoder = new TextEncoder();
const sharedDecoder = new TextDecoder();

export const stringToBytes = (str: string): Uint8Array => {
  return sharedEncoder.encode(str);
};

export const bytesToString = (bytes: Uint8Array): string => {
  return sharedDecoder.decode(bytes).replace(/\0/g, '');
};

export const calculateChecksum = (data: Uint8Array): number => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum & CHECKSUM_MASK;
};
