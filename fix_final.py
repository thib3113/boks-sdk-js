import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

# Make sure lower case is supported!
if "97 + i" not in content:
    content = content.replace(
        "// Lowercase hex is not supported per project requirements.\n// Keys are always uppercase.",
        "// 'a'-'f'\nfor (let i = 0; i < 6; i++) {\n  HEX_DECODE_TABLE[97 + i] = 10 + i;\n}"
    )

if "export const cleanHexString" not in content:
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
        r'export const hexToBytes = \(hex: string\): Uint8Array => \{.*?\n};\n',
        new_funcs + '\n',
        content,
        flags=re.DOTALL
    )

if "reverse?: boolean" not in content and "reverse: boolean = false" not in content:
    bytesToHex_new = """export const bytesToHex = (bytes: Uint8Array, reverse: boolean = false): string => {
  const len = bytes.length;
  if (len === 0) {
    return '';
  }

  if (reverse) {
    if (len === 6) {
      return (
        HEX_TABLE[bytes[5]] +
        HEX_TABLE[bytes[4]] +
        HEX_TABLE[bytes[3]] +
        HEX_TABLE[bytes[2]] +
        HEX_TABLE[bytes[1]] +
        HEX_TABLE[bytes[0]]
      );
    }

    let result = '';
    for (let i = len - 1; i >= 0; i--) {
      result += HEX_TABLE[bytes[i]];
    }
    return result;
  }

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
  for (; i <= len - 2; i += 2) {
    result += HEX_TABLE_16[(bytes[i] << 8) | bytes[i + 1]];
  }
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

with open('src/utils/converters.ts', 'w') as f:
    f.write(content)

# Update PayloadMapper.ts
with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

content = content.replace("HEX_TABLE[payload[${o + 5}]] +\n              HEX_TABLE[payload[${o + 4}]] +\n              HEX_TABLE[payload[${o + 3}]] +\n              HEX_TABLE[payload[${o + 2}]] +\n              HEX_TABLE[payload[${o + 1}]] +\n              HEX_TABLE[payload[${o}]]", "bytesToHex(payload.subarray(${o}, ${o} + 6), true)")

content = re.sub(r'^\s*private static readonly HEX_TABLE = Array.*?\);\n', '', content, flags=re.MULTILINE|re.DOTALL)
content = content.replace("      'HEX_TABLE',\n", "")
content = content.replace("      this.HEX_TABLE,\n", "")

with open('src/protocol/decorators/PayloadMapper.ts', 'w') as f:
    f.write(content)
