# PIN Generation Algorithm

The Boks ecosystem uses a custom derivation algorithm to generate 6-character alphanumeric PIN codes from a 32-byte **Master Key**. This allows the server, the smartphone, and the hardware to stay synchronized without exchanging actual PINs over the air.

## Theoretical Overview

The algorithm is based on a modified **SHA-256** hash (or BLAKE2s in some implementations) with a custom initialization vector and a final character mapping.

### 1. Hash Initialization
Instead of the standard SHA-256 IV, the algorithm uses a specific constant for XORing the initial state:
- **Modifier**: `0x01012006`

### 2. Message Format
The message hashed depends on the type of code and its index:
- **Format**: `"{type} {index}"`
- **Example**: `"single-use 42"` or `"master 0"`

### 3. Character Mapping
The resulting hash is not used directly. The first 6 bytes are extracted and mapped to a 12-character charset:

**Charset**: `0 1 2 3 4 5 6 7 8 9 A B`

Each byte is converted to an index using modulo 12:
`char = Charset[byte % 12]`

## Implementation Details

The SDK provides a high-performance implementation of this algorithm in `src/crypto/pin-algorithm.ts`. It uses shared buffers to minimize memory allocations, making it suitable for low-power devices or high-frequency generation (e.g., generating all 3000 codes in the simulator).

## Why this algorithm?
- **Offline Sync**: A Boks device doesn't need Wi-Fi to know if a code is valid.
- **Security**: Knowing a PIN doesn't reveal the Master Key.
- **Determinism**: The same (Key, Type, Index) tuple always produces the same PIN.
