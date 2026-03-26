const fs = require('fs');

const file = 'tests/core/resilience/uplink/SimpleNotificationPackets.fuzz.test.ts';
let code = fs.readFileSync(file, 'utf8');

// The reason NotifyCodeGenerationProgressPacket failed:
// I removed `constructor(raw?: Uint8Array) { super(raw); }` using `remove_constructors.cjs`.
// Let's check `NotifyCodeGenerationProgressPacket.ts`:
// Its constructor was:
// constructor(progress: number, raw?: Uint8Array) {
//   super(NotifyCodeGenerationProgressPacket.opcode, raw);
//   this.progress = progress;
// }
// Wait, my `remove_constructors.cjs` regex was:
// /^\s*constructor\(raw\?: Uint8Array\) \{\s*super\(raw\);\s*\}\s*$/m
// It did NOT remove that constructor! Because that constructor takes `progress: number`.

// So why did opcode fail?
// Let's check `BoksRXPacket` in `src/protocol/uplink/_BoksRXPacketBase.ts`.
// constructor(protected readonly _opcode: BoksOpcode, protected readonly _raw?: Uint8Array) {
//   super(_raw);
// }
// In BoksPacket:
// constructor(raw?: Uint8Array) { this.#raw = raw; }
// Wait! `NotifyCodeGenerationProgressPacket.opcode` is a static property!
// Wait! `BoksRXPacket` has `get opcode() { return this._opcode; }`.

// Oh I see. In `fix_fromraw.cjs` earlier I did:
// const badReturn = `return new ${className}()`;
// const goodReturn = `return new ${className}(payload)`;
// So `NotifyCodeGenerationProgressPacket.fromRaw` became `return new NotifyCodeGenerationProgressPacket(payload)`.
// `payload` is the Uint8Array array!
// But the constructor takes `progress: number`!
// So it passed the Uint8Array `payload` as `progress: number` !!
// And since it didn't pass a second argument `raw`, `raw` was undefined.
