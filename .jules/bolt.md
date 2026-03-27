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

## 2025-06-12 - Optimizing Fallback String Replacement in Hex Decoding
**Learning:** Using `.replace(/\s/g, '')` in a slow path to clean strings before decoding creates temporary string allocations that severely degrade performance. By implementing a manual single-pass decode loop that skips specific characters (like space, charCode 32) inline, we avoided regex allocations and made the parsing path ~2.5x faster.
**Action:** In parsing or conversion utilities, avoid `.replace()` or string mutations for data sanitization; instead, handle invalid characters or skippable characters inline within the single-pass processing loop.

## 2024-05-18 - Uint8Array subarray vs slice
**Learning:** Using `Uint8Array.subarray()` instead of `Uint8Array.slice()` prevents copying the underlying memory buffer, which is significantly faster and creates less garbage collection pressure in hot paths like packet parsing.
**Action:** Always prefer `subarray()` over `slice()` when extracting parts of a `Uint8Array` unless a true copy is strictly necessary to prevent mutation.

## 2025-10-26 - Native String Coercion for Integer to ASCII Byte Conversion
**Learning:** In V8, converting an integer to ASCII bytes using manual floating point math (`Math.floor(val/10)`) and modulo operations in a loop is significantly slower than relying on native string coercion (`'' + index`) and `.charCodeAt()`. V8's native C++ number-to-string conversion avoids JS execution overhead.
**Action:** When converting integers to byte buffers in hot paths, prefer `const str = '' + num;` followed by a loop over `str.charCodeAt(i)` instead of manual arithmetic logic.

## 2025-03-01 - Optimizing Hex Encoding with 16-bit Lookups
**Learning:** In hot loops like `bytesToHex`, iterating 1 byte at a time and doing string concatenation is still a minor bottleneck. By precomputing a 16-bit lookup table (`HEX_TABLE_16` with 65,536 elements) we can read 2 bytes per iteration, yielding a ~2x performance speedup in V8 because we halve both loop iterations and the number of string concatenations.
**Action:** When working with continuous byte conversions in hot paths, consider reading multiple bytes (e.g., pairs via bitwise shifts `(a << 8) | b`) using a larger lookup table if memory permits.

## 2025-05-18 - String and Bytes conversion overhead
**Learning:** For short pure-ASCII strings (like 6-digit PINs and 8-char hex keys), the instantiation or even execution overhead of the native `TextEncoder` and `TextDecoder` (or even reusing a shared instance) can be a significant bottleneck compared to a simple manual JS loop using `charCodeAt()` and `String.fromCharCode()`. In Node.js / V8, converting short ASCII strings to `Uint8Array` can be ~8-9x faster using a manual loop, and converting `Uint8Array` to an ASCII string can be ~2x faster.
**Action:** When working with high-frequency conversions of short strings that are predominantly ASCII, implement an optimistic ASCII fast-path loop that checks for `charCode > 127`, and only fallback to `TextEncoder`/`TextDecoder` if non-ASCII characters are encountered.

## 2025-10-26 - Repeated TextEncoder/Decoder Instantiation in Business Logic
**Learning:** Using `new TextEncoder()` and `new TextDecoder()` inline within methods like `refreshVersions` or `triggerDoorOpen` incurs repeated instantiation overhead, which can be easily avoided by using centralized parsing utilities.
**Action:** Use shared string parsing utilities like `bytesToString` and `stringToBytes` from `src/utils/converters.ts` to benefit from pre-established fast paths and cached encoder/decoder instances, instead of scattering standard library instantiations.

## 2025-10-26 - Loop Overhead in High-Frequency Array to String Formatting
**Learning:** In V8, loop overhead and array iteration for formatting small, fixed-size byte arrays (like 6-byte MAC addresses) into strings can be a bottleneck. By unrolling the loop and manually concatenating pre-mapped string values (e.g. `HEX_TABLE[bytes[0]] + ':' + ...`), we observed an ~8-9x performance speedup.
**Action:** Introduce explicit fast-paths for highly predictable, common array sizes (like 6 for MAC addresses) using manual string concatenation instead of loops when optimizing hot paths.

## 2025-10-26 - Empty Uint8Array Instantiation Overhead
**Learning:** Repeatedly instantiating `new Uint8Array(0)` for empty payloads in packets (e.g. `AskDoorStatusPacket.toPayload()`) or simulator logic causes unnecessary GC pressure. Replacing these with a shared `EMPTY_BUFFER` constant is highly effective at reducing memory allocation in high-frequency scenarios.
**Action:** Use the `EMPTY_BUFFER` constant from `src/protocol/constants.ts` instead of `new Uint8Array(0)` across the codebase.

## 2025-10-26 - Loop Unrolling for Checksum Calculation
**Learning:** In V8, the simple `for` loop in `calculateChecksum` can be optimized by unrolling. Processing 4 bytes per iteration (`sum += data[i] + data[i+1] + data[i+2] + data[i+3]`) yielded a measurable speedup (~1.5x-1.7x) by significantly reducing loop condition checks and increment overhead.
**Action:** When performing simple arithmetic aggregation over long TypedArrays in hot paths, apply manual loop unrolling (handling remainders appropriately) to maximize execution speed.

## 2025-10-26 - Hex Formatting Allocation Overhead
**Learning:** Using `.match(/.{1,2}/g)?.join(':')` to format hex strings allocates a new array, compiles/executes a regex, and joins elements, which is surprisingly slow (135ms per 100k operations). By replacing it with the `bytesToMac(uidBytes, false)` utility, which relies on a simple loop and precomputed lookup tables (`+=`), we eliminate these allocations and achieve a ~5.8x performance speedup (23ms per 100k operations).
**Action:** When converting byte arrays into colon-separated hex strings like MAC addresses or UIDs, always use `bytesToMac` and avoid allocating intermediate arrays and regex objects.

## 2025-10-26 - Static String Validation Overhead
**Learning:** Using regular expressions like `/^[0-9A-B]{6}$/.test(pin)` for simple static character checks incurs noticeable execution and compilation overhead compared to a manual `charCodeAt` bounds check in a `for` loop, especially in high-frequency V8 calls.
**Action:** When validating fixed formats composed of ASCII characters (like hex keys, PIN codes, or UIDs), prefer standard loops over `.charCodeAt()` combined with length validation, rather than regex bounds matchers.

## 2025-10-26 - Direct Buffer Assignment for Static Length Strings
**Learning:** Using `stringToBytes` followed by copying into a payload buffer via `.set()` and `subarray()` causes unnecessary GC pressure and execution overhead, especially for small static-length ASCII strings like 6-character PINs. Direct sequential buffer assignments (`payload[offset] = pin.charCodeAt(0)`) avoids arrays entirely and can execute up to ~10x faster.
**Action:** When inserting small fixed-length ASCII strings (like 6-char PINs) into payload buffers, write them directly using a helper like `writePinToBuffer` with unrolled `charCodeAt` statements.

## 2025-10-26 - String Replacement Allocation Overhead in Validation
**Learning:** Using `.replace(/:/g, '')` or `.replace(/[^0-9A-Fa-f]/g, '')` simply to count valid characters or compute the length of a cleaned string causes unnecessary intermediate string allocations. In hot code paths like `validateNfcUid` or `validateSeed`, iterating over the original string and counting valid characters inline avoids regex overhead and Garbage Collection pauses, yielding a ~3.4x to ~4.7x speedup in V8.
**Action:** When validating formats or determining the effective payload length from a formatted string (like UIDs or seeds), iterate through the original string and ignore formatting characters directly instead of mutating the string.

## 2025-05-18 - PIN Lookup Optimization
**Learning:** Mapping 6 bytes to 6 characters sequentially from `BOKS_CHAR_MAP` string in a hot loop is slower than grouping mapping.
**Action:** Use a precomputed 16-bit lookup table `PIN_LOOKUP_16BIT` to map 2 bytes to 2 characters simultaneously, significantly reducing sequential modulo and bitwise operations overhead (around 1.2x speedup).

## YYYY-MM-DD - [Converters] **Optimized:** `hexToBytes` (src/utils/converters.ts)
**Bottleneck:** Intermediate string allocations and regex execution overhead (`.replace(/:/g, '')`, `.replace(/[^0-9A-Fa-f]/g, '')`) before parsing hex strings.
**Solution:** Extended the `hexToBytes` slow path `for` loop to explicitly ignore formatting character codes `58` (colon `:`) and `45` (hyphen `-`), in addition to whitespace. Removed upstream regex sanitizations in `NfcRegisterPacket.ts`, `UnregisterNfcTagPacket.ts`, and `BoksSimulator.ts`, allowing native zero-allocation parsing.

## 2025-10-26 - Config Key Buffer Allocation Overhead
**Learning:** Writing a static 8-character Config Key to a buffer using `payload.set(stringToBytes(key))` involves multiple intermediate allocations and copies, which is surprisingly slow. By replacing it with an unrolled direct assignment loop `writeConfigKeyToBuffer`, we avoided GC allocations and observed a ~27x performance speedup in V8 (17ms vs 473ms for 1,000,000 operations).
**Action:** When inserting small fixed-length ASCII strings (like 8-character Config Keys) into payload buffers, write them directly using a helper like `writeConfigKeyToBuffer` with unrolled `charCodeAt` statements rather than relying on `stringToBytes`.

## 2025-10-26 - Config Key Extraction Overhead
**Learning:** Extracting a static 8-character Config Key from a buffer using `bytesToString(payload.subarray(0, 8))` involves subarray allocation and a loop with string concatenation in `bytesToString`, which is surprisingly slow. By creating a `readConfigKeyFromBuffer` utility that unrolls the loop using `String.fromCharCode`, we avoided GC allocations and observed a ~5.3x performance speedup in V8 (42ms vs 224ms for 1,000,000 operations).
**Action:** When extracting small fixed-length ASCII strings (like 8-character Config Keys) from payload buffers, read them directly using a helper like `readConfigKeyFromBuffer` with an unrolled `String.fromCharCode` instead of relying on generic `bytesToString` with a subarray.

## 2025-10-26 - PIN Extraction Overhead
**Learning:** Similar to Config Keys, extracting a static 6-character PIN from a buffer using `bytesToString(payload.subarray(8, 14))` involves subarray allocation and a loop with string concatenation. Creating a `readPinFromBuffer` utility using `String.fromCharCode` avoids GC allocations and yields a similar speedup.
**Action:** Extract small fixed-length ASCII PINs using an unrolled helper like `readPinFromBuffer`.

## 2025-10-26 - Map vs Array Lookup for Small Integer Keys
**Learning:** In V8, using a `Map` for key-value lookups where the keys are small, dense integers (like 1-byte opcodes ranging from 0 to 255) incurs significant overhead compared to direct Array indexing. A benchmark demonstrated that a direct Array lookup `array[index]` is ~4x faster than `map.get(key)` for 10M iterations (22ms vs 86ms).
**Action:** When implementing registries or lookup tables keyed by small, bounded integers (e.g., opcodes, status codes), prefer pre-allocated fixed-size arrays over `Map` objects to maximize access speed in hot paths like packet parsing.

## 2025-10-26 - Null Byte Stripping Performance Overhead
**Learning:** Using `.replace(/\0/g, '')` on the result of `String.fromCharCode` to strip null byte padding is unexpectedly slow in V8 (up to ~6x slower) compared to an unrolled conditional concatenation loop. The regex operation forces intermediate string allocations and compilation overhead that negates the benefits of fast ASCII fast-paths.
**Action:** When reading fixed-length strings from buffers that might contain null byte padding (like PINs, Config Keys, or parsed payloads), use an unrolled loop that checks `if (char !== 0)` before concatenation instead of relying on regex replacements on the final string.

## 2025-10-26 - Memory Leaks with Map vs WeakMap
**Learning:** Using `Map` to cache metadata or compiled functions keyed by class constructors or instances can lead to memory leaks, especially when classes or objects are created dynamically or when instances are no longer needed but remain referenced by the cache. Switching to `WeakMap` resolves this issue, allowing garbage collection of unreferenced keys while maintaining caching benefits.
**Action:** When caching objects or functions using classes or instances as keys, prefer `WeakMap` over `Map` to avoid memory leaks.

## 2025-10-26 - Loop Overhead in Hex Formatting for Common Byte Array Lengths
**Learning:** Using a loop to convert commonly sized byte arrays (e.g., length 4, 7, and 10 which are common for NFC UIDs) into hex strings incurs unnecessary loop condition and iteration overhead in V8. While `bytesToHex` already processes 2 bytes at a time, adding unrolled fast paths for these specific lengths using manual concatenation avoids the loop entirely and provides an ~3x performance speedup.
**Action:** When working with high-frequency conversions of common fixed-length byte arrays, consider implementing explicit fast paths without loops, relying solely on sequential direct index access and precomputed string concatenations.

## 2025-10-26 - Uint8Array Array.from(payload).every() Overhead
**Learning:** Using `Array.from(uint8Array).every()` to check buffer contents creates unnecessary array allocations and callback overhead. A simple `for` loop is significantly faster. Benchmarking showed that replacing `Array.from(payload).every((b) => b === INVALID_BYTE)` with a manual `for` loop provided a ~21x speedup in V8 (~25ms vs ~540ms for 1,000,000 iterations).
**Action:** Always use manual `for` loops for basic validation or value checks over `Uint8Array`s instead of array conversion and higher-order functions like `every()`.

## 2025-10-26 - Loop Unrolling vs Native JIT Optimization in Simple Loops
**Learning:** While unrolling loops manually (`for (; i <= len - 4; i += 4) { sum += data[i] + data[i+1]... }`) can seem like an optimization, modern V8 and JS engines can optimize simple `for` loops more efficiently than complex unrolled code, especially for typed array iteration like `Uint8Array`. Replacing a 4-unrolled loop with a standard `for (let i = 0; i < data.length; i++) { sum += data[i]; }` yielded a ~20% speedup on 1000-element arrays and ~40% speedup on short arrays (6-16 bytes). The JIT compiler natively understands simple array iterations and applies the most efficient machine-level unrolling itself.
**Action:** Avoid manual loop unrolling for simple linear aggregations over arrays unless rigorous benchmarking proves it is faster for your specific data size. Prefer clean, idiomatic `for` loops to let the JIT optimize.

## 2025-10-26 - Uint8Array subarray vs start/end index parameters
**Learning:** Passing `start` and `end` indices to iteration functions instead of allocating new `Uint8Array` views via `subarray()` avoids intermediate allocations and can significantly improve execution speed in hot paths (like checksum calculation or packet validation). Benchmarking showed a ~1.7x speedup in V8.
**Action:** When iterating over a portion of a `Uint8Array` in high-frequency functions, pass explicit `start` and `end` index boundaries rather than calling `.subarray()`.

## YYYY-MM-DD - [Decorators] **Optimized:** \`PayloadMapper\` Hex String Parsing
**Bottleneck:** Using \`s.substring(i * 2, i * 2 + 2)\` and \`parseInt(..., 16)\` inside a dynamically generated function loop caused significant string allocation overhead and slow execution paths during packet decoding (e.g., MAC Addresses and NFC UIDs).
**Solution:** Injected a fast inline \`parseHex\` utility directly into the generated `fnBody` for the \`mac_address\`, \`hex_string\`, and \`var_len_hex\` decorators. This function relies on basic \`charCodeAt\` math and bitwise operations instead of string allocations, yielding up to a ~5.5x speedup during payload deserialization without adding dependency overhead to the generated function.
**Action:** When dynamically generating code strings that parse hexadecimal data, always prefer embedding a small inline parsing block over native \`parseInt\` + \`substring\` combinations.

## 2025-10-26 - String Parsing Overhead in Semantic Version Comparison
**Learning:** Using `v.split('.').map(Number)` to parse semantic versions creates an array of strings, an array of numbers, and incurs string iteration/allocation costs. This is a common micro-optimization bottleneck in hot paths. By manually traversing the string and calculating numeric values, we entirely avoid array and string chunk allocations.
**Action:** When parsing and comparing semantic versions or similar dot-separated numeric strings, use a manual loop that calculates numeric parts sequentially without splitting strings or creating arrays. This provides an ~11x performance speedup in V8.

## YYYY-MM-DD - [Decorators] Hex Parsing Optimization in PayloadMapper JIT
**Learning:** In dynamically generated JIT functions (`compileParser`), decoding variable-length hex fields by iterating byte-by-byte with a 256-element `HEX_TABLE` is slower and causes more string allocations than using a 16-bit lookup. Benchmarks demonstrated that leveraging the `bytesToHex` utility, which natively processes 2 bytes at a time using a `HEX_TABLE_16` precomputed array and avoids `subarray` allocation for static loops, provides a ~2.4x execution speedup in V8.
## 2025-10-26 - Event Dispatch Loop Overhead
**Learning:** Iterating through the listeners Set and filter arrays using native array/set methods like `.forEach()`, `.some()` and `.includes()` creates substantial callback function allocations and context-switching overhead in hot paths such as packet handling. Refactoring `emitClientEvent` and `emit` to use standard `for...of` over the listeners `Set` and an explicit `for` loop over the filters provides a ~3.5x performance boost (75ms down to 21ms for 100k invocations).
**Action:** When creating high-frequency event emitters or packet routers, avoid higher-order array and set functions like `.forEach` and `.some` and prefer raw `for` loops to reduce allocation and iteration overhead.
