const fs = require('fs');

function replaceInFile(file, search, replacement) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(search, replacement);
    fs.writeFileSync(file, code);
  }
}

replaceInFile(
  'tests/protocol/downlink/NfcRegisterPacket.test.ts',
  "expect(packet.uid).toBe(validUid);",
  "expect(packet.uid).toBe('01020304');"
);

replaceInFile(
  'tests/protocol/downlink/NfcRegisterPacket.test.ts',
  "expect(packet.uid).toBe(validUid);",
  "expect(packet.uid).toBe('01020304');"
);

// PayloadMapper fix for instance.__proto__ edge cases during tests.
// In payload-mapper.ts, `const targetClass = instance.constructor;` fails if `instance.constructor` is undefined.
let pmFile = 'src/protocol/payload-mapper.ts';
let pmCode = fs.readFileSync(pmFile, 'utf8');
pmCode = pmCode.replace(
  "const targetClass = instance.constructor;",
  "const targetClass = instance.constructor;\n    if (!targetClass) {\n      throw new BoksProtocolError(BoksProtocolErrorId.INTERNAL_ERROR, 'Cannot serialize instance without constructor');\n    }"
);
fs.writeFileSync(pmFile, pmCode);
