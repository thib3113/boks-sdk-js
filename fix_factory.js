import fs from 'fs';
let code = fs.readFileSync('src/protocol/BoksPacketFactory.ts', 'utf8');
code = code.replace("import { BoksExpectedReason } from '@/errors/BoksExpectedReason';\n", "");
fs.writeFileSync('src/protocol/BoksPacketFactory.ts', code);
