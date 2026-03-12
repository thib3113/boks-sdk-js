const fs = require('fs');

let fileNfcReg = 'src/protocol/downlink/NfcRegisterPacket.ts';
let codeNfcReg = fs.readFileSync(fileNfcReg, 'utf8');
codeNfcReg = codeNfcReg.replace(/bytesToMac/g, "bytesToHex");
fs.writeFileSync(fileNfcReg, codeNfcReg);

let fileUnreg = 'src/protocol/downlink/UnregisterNfcTagPacket.ts';
let codeUnreg = fs.readFileSync(fileUnreg, 'utf8');
codeUnreg = codeUnreg.replace(/bytesToMac/g, "bytesToHex");
fs.writeFileSync(fileUnreg, codeUnreg);

let fileBoksBase = 'src/protocol/_BoksPacketBase.ts';
let codeBoksBase = fs.readFileSync(fileBoksBase, 'utf8');
codeBoksBase = codeBoksBase.replace(
  "import { calculateChecksum, bytesToHex } from '@/utils/converters';",
  "import { calculateChecksum, bytesToHex, hexToBytes } from '@/utils/converters';"
);
codeBoksBase = codeBoksBase.replace(
  "return uid.toUpperCase();",
  "return bytesToHex(hexToBytes(uid)).toUpperCase();"
);
fs.writeFileSync(fileBoksBase, codeBoksBase);
