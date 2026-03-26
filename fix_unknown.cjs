const fs = require('fs');

let file = 'src/protocol/uplink/UnknownPacket.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/constructor\(opcode: number, payload: Uint8Array, raw\?: Uint8Array\) \{/, 'constructor(opcode: number, payload: Uint8Array) {');
code = code.replace(/super\(raw \?\? payload\);/, 'super(payload);');

code = code.replace(/static fromUnknownPayload\(opcode: number, payload: Uint8Array, raw\?: Uint8Array\): UnknownPacket \{/, 'static fromUnknownPayload(opcode: number, payload: Uint8Array): UnknownPacket {');
code = code.replace(/return new UnknownPacket\(opcode, payload, raw \?\? payload\);/, 'return new UnknownPacket(opcode, payload);');

fs.writeFileSync(file, code);
