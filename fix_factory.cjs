const fs = require('fs');

let file = 'src/protocol/BoksPacketFactory.ts';
let code = fs.readFileSync(file, 'utf8');
if (code.includes('UnknownPacket.fromUnknownPayload(opcode, payload, raw)')) {
  code = code.replace(/UnknownPacket\.fromUnknownPayload\(opcode, payload, raw\)/g, 'UnknownPacket.fromUnknownPayload(opcode, payload)');
  fs.writeFileSync(file, code);
}
