import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

# Update HEX_DECODE_TABLE loop for lowercase hex
content = content.replace(
    "// Lowercase hex is not supported per project requirements.\n// Keys are always uppercase.",
    "// 'a'-'f'\nfor (let i = 0; i < 6; i++) {\n  HEX_DECODE_TABLE[97 + i] = 10 + i;\n}"
)

# Remove cleanHexString
content = re.sub(r'/\*\*\n \* Quickly strips whitespace.*?\nexport const cleanHexString = .*?};\n', '', content, flags=re.DOTALL)

# Update hexToBytes
hexToBytes_new = """export const hexToBytes = (hex: string): Uint8Array => {
  const len = hex.length;
  // Optimization: fast path for clean hex strings
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

    if (isClean) {
      return bytes;
    }
  }

  // Slow path: contains whitespace or invalid characters
  // We decode in a single pass ignoring all invalid characters
  const bytes = new Uint8Array(len >>> 1); // Max possible length
  let j = 0;
  let high = -1;
  let skippedChars = 0;

  for (let i = 0; i < len; i++) {
    const charCode = hex.charCodeAt(i);
    const val = HEX_DECODE_TABLE[charCode];

    // Ignore all non-hex characters
    if (val === 255 || val === undefined) {
      skippedChars++;
      continue;
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

  return j === bytes.length ? bytes : bytes.subarray(0, j);
};"""

content = re.sub(r'export const hexToBytes = \(hex: string\): Uint8Array => \{.*?\n\};\n', hexToBytes_new + '\n', content, flags=re.DOTALL)

# Update bytesToHex and remove bytesToMac
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

content = re.sub(r'export const bytesToHex = \(bytes: Uint8Array\): string => \{.*?return result;\n};\n', bytesToHex_new + '\n', content, flags=re.DOTALL)
content = re.sub(r'/\*\*\n \* Formats a byte array as a MAC address.*?\nexport const bytesToMac = .*?};\n', '', content, flags=re.DOTALL)
content = re.sub(r'const formatMac6 = .*?};\n', '', content, flags=re.DOTALL)


with open('src/utils/converters.ts', 'w') as f:
    f.write(content)
