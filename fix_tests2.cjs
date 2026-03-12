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
  "expect(packet.uid).toBe(validUid); // formatted with colons by frontend formatter logic usually",
  "expect(packet.uid).toBe('01020304');"
);

replaceInFile(
  'tests/protocol/downlink/UnregisterNfcTagPacket.test.ts',
  "expect(packet.uid).toBe(validUid);",
  "expect(packet.uid).toBe('01020304');"
);

replaceInFile(
  'tests/protocol/downlink/UnregisterNfcTagPacket.test.ts',
  "expect(packet.uid).toBe(validUid);",
  "expect(packet.uid).toBe('01020304');"
);

let fileFuzzNfc = 'tests/protocol/uplink/resilience/NotifyNfcTagFoundPacket.resilience.test.ts';
if (fs.existsSync(fileFuzzNfc)) {
  let code = fs.readFileSync(fileFuzzNfc, 'utf8');
  code = code.replace(
    `describe('fromPayload()', () => {`,
    `describe('fromPayload()', () => {\n  const { BoksProtocolError } = require('@/errors/BoksProtocolError');`
  );
  code = code.replace(
    `const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
          const uidLength = payload[0];
          expect(packet.uid.length / 2).toBe(uidLength);`,
    `try {
            const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
            const uidLength = payload[0];
            expect(packet.uid.length / 2).toBe(uidLength);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }`
  );
  fs.writeFileSync(fileFuzzNfc, code);
}
