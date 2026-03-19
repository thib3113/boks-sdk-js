const fs = require('fs');

let fileContent = fs.readFileSync('tests/protocol/BoksPacketFactory.test.ts', 'utf8');

fileContent = fileContent.replace(
  "if (typeof Packets[key] === 'function' && 'opcode' in Packets[key]) {\n      BoksPacketFactory.register(Packets[key] as any);\n    }",
  "const p = (Packets as any)[key];\n    if (typeof p === 'function' && 'opcode' in p) {\n      BoksPacketFactory.register(p as any);\n    }"
);

fs.writeFileSync('tests/protocol/BoksPacketFactory.test.ts', fileContent, 'utf8');
