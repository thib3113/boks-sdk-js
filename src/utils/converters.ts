import { CHECKSUM_MASK } from '../protocol/constants';

/**
 * Utility functions for Boks SDK
 */

// Optimization: Precompute hex lookup table to avoid expensive toString(16) calls
const HEX_TABLE = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0').toUpperCase()
);

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
  const cleanHex = hex.replace(/\s/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const len = cleanHex.length;
  const bytes = new Uint8Array(len / 2);

  for (let i = 0; i < len; i += 2) {
    const high = HEX_DECODE_TABLE[cleanHex.charCodeAt(i)];
    const low = HEX_DECODE_TABLE[cleanHex.charCodeAt(i + 1)];

    if (high === undefined || low === undefined || high === 255 || low === 255) {
      throw new Error('Invalid hex character');
    }

    bytes[i / 2] = (high << 4) | low;
  }
  return bytes;
};

export const bytesToHex = (bytes: Uint8Array): string => {
  const len = bytes.length;
  const arr = new Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = HEX_TABLE[bytes[i]];
  }
  return arr.join('');
};

export const stringToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

export const bytesToString = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes).replace(/\0/g, '');
};

export const calculateChecksum = (data: Uint8Array): number => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum & CHECKSUM_MASK;
};
