import fs from 'fs';
let code = fs.readFileSync('src/protocol/uplink/UnknownPacket.ts', 'utf8');
code = code.replace("toJSON(): any {", "// eslint-disable-next-line @typescript-eslint/no-explicit-any\n  toJSON(): any {");
fs.writeFileSync('src/protocol/uplink/UnknownPacket.ts', code);
