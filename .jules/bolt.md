## 2025-10-26 - Hex Conversion Optimization
**Learning:** `Array.from(bytes).map(...)` for hex conversion is a major bottleneck (5.7x slower than lookup table).
**Action:** Always use precomputed lookup tables for byte-to-hex conversion in high-frequency paths.

## 2025-10-26 - `parseInt` Behavior in Hex Parsing
**Learning:** Replacing `parseInt(substr, 16)` with a lookup table changes behavior for invalid characters (e.g., 'G'). `parseInt` allows lenient parsing (ignores invalid suffix), while strict lookups may treat invalid chars as 0 or throw.
**Action:** When optimizing `hexToBytes`, ensure exact behavior parity for invalid inputs or explicitly decide to change validation logic.

## 2026-02-22 - Pin Generation String Allocation
**Learning:** In `generateBoksPin`, constructing the message string via `${typePrefix} ${index}` allocated an intermediate string. Replacing this with direct `encodeInto` writes to the buffer improved performance by ~5.7% (589ms vs 625ms for 100k ops).
**Action:** Avoid string concatenation for binary payloads; write components directly to the target buffer using `TextEncoder.encodeInto` and manual byte assignment.

## 2025-05-18 - Shared Buffers in PIN Generation
**Learning:** High-frequency object allocation (TypedArrays) in hot loops (like bulk PIN generation) causes significant GC pressure even if CPU time looks fine.
**Action:** Use module-level shared buffers for synchronous, single-threaded hot paths to eliminate allocation overhead, ensuring they are wiped in a `finally` block for security.

## 2026-06-18 - Redundant Hashing in Bulk Operations
**Learning:** The Simulator initializes by generating 3305 PINs from the same Master Key. Recalculating the BLAKE2s state for the constant Key Block (64 bytes) 3305 times accounted for ~65% of the total execution time.
**Action:** Identify invariant inputs in cryptographic loops and expose an API to precompute and reuse intermediate hash states (context).

## 2024-05-18 - String Concatenation vs Array.join for Hex Encoding
**Learning:** In V8 (Node.js/Chrome), using simple string concatenation `+=` for small string building (like hex encoding byte arrays) is significantly faster (often 2x faster) than creating an array and calling `Array.join('')`. The overhead of array allocation and the `join` method call outweighs string concatenation optimizations in V8 for these lengths.
**Action:** Replace `Array.join('')` with string concatenation `+=` in hot loop encoding functions like `bytesToHex`.

## 2024-05-18 - Reusing TextDecoder instances
**Learning:** Instantiating a `new TextDecoder()` inside a hot function is noticeably slower than reusing a single shared `TextDecoder` instance. While `TextEncoder` instantiation seems optimized in newer V8 versions, `TextDecoder` instantiation still carries a measurable performance penalty.
**Action:** Share and reuse a single `TextDecoder` instance across calls instead of creating a new one on every `bytesToString` invocation.

## 2024-05-18 - Uint8Array subarray vs slice
**Learning:** Using `Uint8Array.subarray()` instead of `Uint8Array.slice()` prevents copying the underlying memory buffer, which is significantly faster and creates less garbage collection pressure in hot paths like packet parsing.
**Action:** Always prefer `subarray()` over `slice()` when extracting parts of a `Uint8Array` unless a true copy is strictly necessary to prevent mutation.

## 2025-10-26 - Native String Coercion for Integer to ASCII Byte Conversion
**Learning:** In V8, converting an integer to ASCII bytes using manual floating point math (`Math.floor(val/10)`) and modulo operations in a loop is significantly slower than relying on native string coercion (`'' + index`) and `.charCodeAt()`. V8's native C++ number-to-string conversion avoids JS execution overhead.
**Action:** When converting integers to byte buffers in hot paths, prefer `const str = '' + num;` followed by a loop over `str.charCodeAt(i)` instead of manual arithmetic logic.
