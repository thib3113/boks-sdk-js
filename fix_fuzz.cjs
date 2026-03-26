const fs = require('fs');
let file = 'tests/core/resilience/uplink/SimpleNotificationPackets.fuzz.test.ts';
let code = fs.readFileSync(file, 'utf8');

// Fast-check was throwing "expected +0 to be 194"
// Let's check why `packet.opcode` is 0, wait, it's `expect(packet.opcode).toBe(0xc2)`. 0xc2 = 194.
// But `packet.opcode` was returning 0!
// This is because `NotifyCodeGenerationProgressPacket` extends `BoksRXPacket`.
// Wait, `NotifyCodeGenerationProgressPacket` sets `#dynamicOpcode` using `super(NotifyCodeGenerationProgressPacket.opcode, raw)`.
// `BoksRXPacket` constructor is `constructor(opcode: number, raw?: Uint8Array) { super(raw); this.#dynamicOpcode = opcode; }`
// So `packet.opcode` should definitely be `NotifyCodeGenerationProgressPacket.opcode` which is 0xc2 (194).
// Why was it 0?
