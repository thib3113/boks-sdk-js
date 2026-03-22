import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

new_hexToBytes = """/**
 * Strips all non-hexadecimal characters from a string and returns an uppercase hex string.
 * This is heavily optimized to avoid regexes and intermediate array allocations.
 */
export const cleanHexString = (hex: string): string => {
  const len = hex.length;
  let clean = '';
  let isDirty = false;

  for (let i = 0; i < len; i++) {
    const code = hex.charCodeAt(i);
    const val = HEX_DECODE_TABLE[code];

    if (val === 255 || val === undefined) {
      if (!isDirty) {
        clean = hex.substring(0, i);
        isDirty = true;
      }
      continue;
    }

    if (isDirty) {
      const upperChar = code >= 97 && code <= 102 ? String.fromCharCode(code - 32) : hex[i];
      clean += upperChar;
    }
  }

  return isDirty ? clean : hex.toUpperCase();
};

export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = cleanHexString(hex);
  const len = cleanHex.length;

  if ((len & 1) !== 0) {
    throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
      received: len,
      reason: 'ODD_LENGTH'
    });
  }

  const bytes = new Uint8Array(len >>> 1);
  for (let i = 0, j = 0; i < len; i += 2, j++) {
    const high = HEX_DECODE_TABLE[cleanHex.charCodeAt(i)];
    const low = HEX_DECODE_TABLE[cleanHex.charCodeAt(i + 1)];
    bytes[j] = (high << 4) | low;
  }

  return bytes;
};"""

content = re.sub(
    r'export const cleanHexString = \(hex: string\): string => \{.*?\n};\n\nexport const hexToBytes = \(hex: string\): Uint8Array => \{.*?\n};\n',
    new_hexToBytes + '\n',
    content,
    flags=re.DOTALL
)

with open('src/utils/converters.ts', 'w') as f:
    f.write(content)
