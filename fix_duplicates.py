import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

# Remove the duplicated cleanHexString and hexToBytes
# I used `if "export const cleanHexString" not in content:` but it WAS in content, so it didn't do what I expected maybe.
# Or it appended twice.
# Wait, I used a regex substitution that maybe failed to capture the old one correctly because I changed it.

import subprocess
subprocess.run(['git', 'checkout', 'HEAD', '--', 'src/utils/converters.ts'])

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

new_funcs = """/**
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

    // If not a valid hex character
    if (val === 255 || val === undefined) {
      if (!isDirty) {
        clean = hex.substring(0, i);
        isDirty = true;
      }
      continue;
    }

    if (isDirty) {
      // Fast uppercase conversion: if it's lowercase a-f (97-102), subtract 32
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

# Find cleanHexString and hexToBytes to replace them
content = re.sub(
    r'/\*\*\n \* Quickly strips whitespace.*?\nexport const hexToBytes = .*?};\n',
    new_funcs + '\n',
    content,
    flags=re.DOTALL
)

bytesToHex_new = """export const bytesToHex = (bytes: Uint8Array, reverse: boolean = false): string => {
  const len = bytes.length;
  if (len === 0) {
    return '';
  }

  if (reverse) {
    if (len === 6) {
      return (
        HEX_TABLE_16[(bytes[4] << 8) | bytes[5]] +
        HEX_TABLE_16[(bytes[2] << 8) | bytes[3]] +
        HEX_TABLE_16[(bytes[0] << 8) | bytes[1]]
      );
    }

    let result = '';
    let i = len - 1;
    // Process backwards 2 bytes at a time
    for (; i >= 1; i -= 2) {
      result += HEX_TABLE_16[(bytes[i] << 8) | bytes[i - 1]];
    }
    // Handle remaining byte for odd lengths
    if (i === 0) {
      result += HEX_TABLE[bytes[0]];
    }
    return result;
  }

  // Optimization: fast paths for common lengths (like 4, 6 for MAC, 7, 10 for NFC UIDs, etc.).
  if (len === 4) {
    return HEX_TABLE_16[(bytes[0] << 8) | bytes[1]] + HEX_TABLE_16[(bytes[2] << 8) | bytes[3]];
  } else if (len === 6) {
    return (
      HEX_TABLE_16[(bytes[0] << 8) | bytes[1]] +
      HEX_TABLE_16[(bytes[2] << 8) | bytes[3]] +
      HEX_TABLE_16[(bytes[4] << 8) | bytes[5]]
    );
  } else if (len === 7) {
    return (
      HEX_TABLE_16[(bytes[0] << 8) | bytes[1]] +
      HEX_TABLE_16[(bytes[2] << 8) | bytes[3]] +
      HEX_TABLE_16[(bytes[4] << 8) | bytes[5]] +
      HEX_TABLE[bytes[6]]
    );
  } else if (len === 10) {
    return (
      HEX_TABLE_16[(bytes[0] << 8) | bytes[1]] +
      HEX_TABLE_16[(bytes[2] << 8) | bytes[3]] +
      HEX_TABLE_16[(bytes[4] << 8) | bytes[5]] +
      HEX_TABLE_16[(bytes[6] << 8) | bytes[7]] +
      HEX_TABLE_16[(bytes[8] << 8) | bytes[9]]
    );
  }

  let result = '';
  let i = 0;
  // Optimization: process 2 bytes at a time using a 16-bit lookup table
  for (; i <= len - 2; i += 2) {
    result += HEX_TABLE_16[(bytes[i] << 8) | bytes[i + 1]];
  }
  // Handle remaining byte for odd lengths
  if (i < len) {
    result += HEX_TABLE[bytes[i]];
  }
  return result;
};"""

content = re.sub(
    r'export const bytesToHex = \(bytes: Uint8Array\): string => \{.*?return result;\n};\n',
    bytesToHex_new + '\n',
    content,
    flags=re.DOTALL
)

# Update a-f lowercase logic
content = content.replace(
    "// Lowercase hex is not supported per project requirements.\n// Keys are always uppercase.",
    "// 'a'-'f'\nfor (let i = 0; i < 6; i++) {\n  HEX_DECODE_TABLE[97 + i] = 10 + i;\n}"
)

# Remove bytesToMac
content = re.sub(
    r'/\*\*\n \* Formats a byte array as a MAC address string.*?\nexport const bytesToMac = .*?};\n',
    '',
    content,
    flags=re.DOTALL
)

with open('src/utils/converters.ts', 'w') as f:
    f.write(content)
