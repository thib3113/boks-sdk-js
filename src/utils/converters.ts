import { CHECKSUM_MASK } from '../protocol/constants';

/**
 * Utility functions for Boks SDK
 */

// Optimization: Precompute hex lookup table to avoid expensive toString(16) calls
const HEX_TABLE = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0').toUpperCase()
);

export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.replace(/\s/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
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
