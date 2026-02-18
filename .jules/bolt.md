# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2024-03-24 - [DataView vs Direct Uint32Array Access]
**Learning:** `DataView` provides endianness safety but is significantly slower than direct typed array access. In most JS environments (V8/SpiderMonkey), the underlying system is little-endian. Direct `Uint32Array` reads are optimized to machine instructions, while `DataView.getUint32` often incurs a function call overhead and endianness check.
**Action:** When optimizing tight crypto loops, replace `DataView` with direct typed array access if little-endian architecture can be assumed or detected.

## 2024-03-24 - [Allocation in Tight Loops]
**Learning:** Allocating typed arrays (e.g., `new Uint32Array(16)`) inside a function called frequently (like a hash compression function) creates significant GC pressure and overhead.
**Action:** Lift allocations out of the tight loop. Pass pre-allocated workspace buffers as arguments to internal helper functions.
