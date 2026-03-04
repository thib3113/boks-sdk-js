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
  // We decode in a single pass ignoring whitespace (space, tab, LF, CR, etc.)
  // Optimization: Avoiding .replace(/\s/g, '') prevents creating a new string.
  const bytes = new Uint8Array(len >>> 1); // Max possible length
  let j = 0;
  let high = -1;
  let skippedChars = 0;

  for (let i = 0; i < len; i++) {
    const charCode = hex.charCodeAt(i);
    // Whitespace chars: 32 (space), 9 (tab), 10 (LF), 13 (CR)
    if (charCode === 32 || charCode === 9 || charCode === 10 || charCode === 13) {
      skippedChars++;
      continue;
    }

    const val = HEX_DECODE_TABLE[charCode];
    if (val === 255 || val === undefined) {
      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
        received: hex[i],
        reason: 'INVALID_HEX_CHAR'
      });
    }

    if (high === -1) {
      high = val;
    } else {
      bytes[j++] = (high << 4) | val;
      high = -1;
    }
  }

  if (high !== -1) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
      received: len - skippedChars,
      reason: 'ODD_LENGTH'
    });
  }

  // If we skipped spaces, the array might be longer than needed
  return j === bytes.length ? bytes : bytes.subarray(0, j);
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
  const len = str.length;
  // Optimization: Fast path for pure ASCII strings (which are common for PINs/Keys).
  // Avoids the overhead of TextEncoder instantiation/execution.
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const code = str.charCodeAt(i);
    // If we hit a non-ASCII character, fallback to full UTF-8 encoding
    if (code > 127) return sharedEncoder.encode(str);
    bytes[i] = code;
  }
  return bytes;
};

export const bytesToString = (bytes: Uint8Array): string => {
  const len = bytes.length;
  let s = '';
  // Optimization: Fast path for pure ASCII strings.
  // Avoids TextDecoder execution which is surprisingly slow in V8 for short strings.
  for (let i = 0; i < len; i++) {
    const b = bytes[i];
    // If we hit a non-ASCII character, fallback to full UTF-8 decoding
    if (b > 127) return sharedDecoder.decode(bytes).replace(/\0/g, '');
    if (b !== 0) s += String.fromCharCode(b);
  }
  return s;
};

/**
 * Formats a byte array as a MAC address (XX:XX:XX:XX:XX:XX).
 * Boks firmware sends MAC addresses in Little Endian, so we reverse by default for Big Endian display.
 */
const formatMac6 = (bytes: Uint8Array, reverse: boolean): string => {
  if (reverse) {
    return (
      HEX_TABLE[bytes[5]] +
      ':' +
      HEX_TABLE[bytes[4]] +
      ':' +
      HEX_TABLE[bytes[3]] +
      ':' +
      HEX_TABLE[bytes[2]] +
      ':' +
      HEX_TABLE[bytes[1]] +
      ':' +
      HEX_TABLE[bytes[0]]
    );
  } else {
    return (
      HEX_TABLE[bytes[0]] +
      ':' +
      HEX_TABLE[bytes[1]] +
      ':' +
      HEX_TABLE[bytes[2]] +
      ':' +
      HEX_TABLE[bytes[3]] +
      ':' +
      HEX_TABLE[bytes[4]] +
      ':' +
      HEX_TABLE[bytes[5]]
    );
  }
};

export const bytesToMac = (bytes: Uint8Array, reverse: boolean = true): string => {
  const len = bytes.length;
  if (len === 0) return '';

  // Optimization: fast path for standard 6-byte MAC addresses.
  // Directly concatenating the 6 hex strings avoids loop overhead
  // and branching, resulting in an ~8-9x performance speedup in V8.
  if (len === 6) return formatMac6(bytes, reverse);

  // Slow path for non-standard lengths
  if (reverse) {
    let result = HEX_TABLE[bytes[len - 1]];
    for (let i = len - 2; i >= 0; i--) {
      result += ':' + HEX_TABLE[bytes[i]];
    }
    return result;
  } else {
    let result = HEX_TABLE[bytes[0]];
    for (let i = 1; i < len; i++) {
      result += ':' + HEX_TABLE[bytes[i]];
    }
    return result;
  }
};

export const calculateChecksum = (data: Uint8Array): number => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum & CHECKSUM_MASK;
};
