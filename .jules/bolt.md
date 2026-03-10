
## 2025-10-26 - Map vs Array Lookup for Small Integer Keys
**Learning:** In V8, using a `Map` for key-value lookups where the keys are small, dense integers (like 1-byte opcodes ranging from 0 to 255) incurs significant overhead compared to direct Array indexing. A benchmark demonstrated that a direct Array lookup `array[index]` is ~4x faster than `map.get(key)` for 10M iterations (22ms vs 86ms).
**Action:** When implementing registries or lookup tables keyed by small, bounded integers (e.g., opcodes, status codes), prefer pre-allocated fixed-size arrays over `Map` objects to maximize access speed in hot paths like packet parsing.
