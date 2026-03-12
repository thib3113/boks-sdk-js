const fs = require('fs');

let fileNfcReg = 'src/protocol/downlink/NfcRegisterPacket.ts';
let codeNfcReg = fs.readFileSync(fileNfcReg, 'utf8');
codeNfcReg = codeNfcReg.replace(/bytesToHex\(payload\.subarray\(9, 9 \+ len\), false\)/g, "bytesToHex(payload.subarray(9, 9 + len))");
fs.writeFileSync(fileNfcReg, codeNfcReg);

let fileUnreg = 'src/protocol/downlink/UnregisterNfcTagPacket.ts';
let codeUnreg = fs.readFileSync(fileUnreg, 'utf8');
codeUnreg = codeUnreg.replace(/bytesToHex\(payload\.subarray\(9, 9 \+ len\), false\)/g, "bytesToHex(payload.subarray(9, 9 + len))");
fs.writeFileSync(fileUnreg, codeUnreg);
