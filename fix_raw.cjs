const fs = require('fs');

const file = 'tests/core/resilience/scale/NotifyScaleRawSensorsPacket.fuzz.test.ts';
let code = fs.readFileSync(file, 'utf8');

// If nothing changed in the packets between lint fix and now, why are they failing the fuzz tests?
// Ah! Wait, `NotifyScaleRawSensorsPacket` constructor is:
// constructor(data: Uint8Array, raw?: Uint8Array)
// But in BoksRXPacketBase constructor is:
// constructor(opcode: number, raw?: Uint8Array) {
//   super(raw);
//   this.#dynamicOpcode = opcode;
// }
// Oh I see. In `NotifyScaleRawSensorsPacket`, `super(NotifyScaleRawSensorsPacket.opcode, raw)` was called.
// BUT I removed `constructor(raw?: Uint8Array) { super(raw); }` across the codebase using string replace!
// And in doing so, I might have replaced `constructor(data: Uint8Array, raw?: Uint8Array) { ... }` ?
// Wait, git diff showed NO differences in those files between 7612ab8 and ca1a3f6.
