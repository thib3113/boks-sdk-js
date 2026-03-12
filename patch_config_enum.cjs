const fs = require('fs');

let constFile = 'src/protocol/constants.ts';
let codeConst = fs.readFileSync(constFile, 'utf8');

if (!codeConst.includes('export enum BoksConfigType')) {
  codeConst = codeConst + `\n\nexport enum BoksConfigType {\n  LaPosteNfc = 1\n}\n`;
  fs.writeFileSync(constFile, codeConst);
}

let setConfigFile = 'src/protocol/downlink/SetConfigurationPacket.ts';
let codeSetConfig = fs.readFileSync(setConfigFile, 'utf8');

codeSetConfig = codeSetConfig.replace(
  "import { BoksOpcode } from '@/protocol/constants';",
  "import { BoksOpcode, BoksConfigType } from '@/protocol/constants';"
);

codeSetConfig = codeSetConfig.replace(
  "public readonly configType: number,",
  "public readonly configType: BoksConfigType,"
);

fs.writeFileSync(setConfigFile, codeSetConfig);
