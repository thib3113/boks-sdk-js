## 2025-10-26 - Hex Conversion Optimization
**Learning:** `Array.from(bytes).map(...)` for hex conversion is a major bottleneck (5.7x slower than lookup table).
**Action:** Always use precomputed lookup tables for byte-to-hex conversion in high-frequency paths.

## 2025-10-26 - `parseInt` Behavior in Hex Parsing
**Learning:** Replacing `parseInt(substr, 16)` with a lookup table changes behavior for invalid characters (e.g., 'G'). `parseInt` allows lenient parsing (ignores invalid suffix), while strict lookups may treat invalid chars as 0 or throw.
**Action:** When optimizing `hexToBytes`, ensure exact behavior parity for invalid inputs or explicitly decide to change validation logic.

## 2026-02-22 - Pin Generation String Allocation
**Learning:** In `generateBoksPin`, constructing the message string via `${typePrefix} ${index}` allocated an intermediate string. Replacing this with direct `encodeInto` writes to the buffer improved performance by ~5.7% (589ms vs 625ms for 100k ops).
**Action:** Avoid string concatenation for binary payloads; write components directly to the target buffer using `TextEncoder.encodeInto` and manual byte assignment.
