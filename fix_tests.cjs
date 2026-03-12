const fs = require('fs');

let file1 = 'tests/protocol/uplink/NotifyNfcTagFoundPacket.test.ts';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace(
  "const payload = new Uint8Array([0x01, 0x02, 0x03, 0x04]);",
  "const payload = new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]);"
);
code1 = code1.replace(
  "it('should handle empty payload (empty uid)', () => {\n    const payload = new Uint8Array(0);\n    const packet = NotifyNfcTagFoundPacket.fromPayload(payload);\n    expect(packet.uid).toBe('');\n  });",
  "it('should throw on empty payload', () => {\n    const payload = new Uint8Array(0);\n    expect(() => NotifyNfcTagFoundPacket.fromPayload(payload)).toThrow();\n  });"
);
fs.writeFileSync(file1, code1);

let file2 = 'tests/core/resilience/uplink/NfcNotificationPackets.fuzz.test.ts';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(
  "import { NotifyNfcTagFoundPacket } from '../../../../src/protocol/uplink/NotifyNfcTagFoundPacket';",
  "import { NotifyNfcTagFoundPacket } from '../../../../src/protocol/uplink/NotifyNfcTagFoundPacket';\nimport { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';"
);
code2 = code2.replace(
  `it('FEATURE REGRESSION: NotifyNfcTagFoundPacket should safely handle arbitrary payload lengths and parse uid', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NotifyNfcTagFoundPacket);
          expect(packet.opcode).toBe(0xC5);
          expect((packet as any).rawPayload).toEqual(payload);
          expect(packet.uid).toBe(bytesToHex(payload));
        }
      ),
      { numRuns: 1000 }
    );
  });`,
  `it('FEATURE REGRESSION: NotifyNfcTagFoundPacket should safely handle arbitrary payload lengths and parse uid', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          try {
            const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
            expect(packet).toBeInstanceOf(NotifyNfcTagFoundPacket);
            expect(packet.opcode).toBe(0xC5);
            expect((packet as any).rawPayload).toEqual(payload);
            const uidLength = payload[0];
            expect(packet.uid).toBe(bytesToHex(payload.subarray(1, 1 + uidLength)));
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });`
);
fs.writeFileSync(file2, code2);

let file3 = 'tests/protocol/uplink/resilience/NotifyNfcTagFoundPacket.resilience.test.ts';
if (fs.existsSync(file3)) {
  let code3 = fs.readFileSync(file3, 'utf8');
  code3 = code3.replace(
    `const packet = NotifyNfcTagFoundPacket.fromPayload(payload);`,
    `try {
            const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }`
  );
  code3 = code3.replace(
    `const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
          expect(packet.uid.length / 2).toBe(payload.length);`,
    `try {
            const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
            const uidLength = payload[0];
            expect(packet.uid.length / 2).toBe(uidLength);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }`
  );
  fs.writeFileSync(file3, code3);
}
