const fs = require('fs');

let testFuzz = 'tests/protocol/uplink/resilience/NotifyNfcTagFoundPacket.resilience.test.ts';
if (fs.existsSync(testFuzz)) {
  let code = fs.readFileSync(testFuzz, 'utf8');
  // Need to fix the syntax error: Unexpected `{` or bad `import`.
  // Currently the file is completely broken. Let's rewrite it quickly.
  code = `import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyNfcTagFoundPacket } from '@/protocol/uplink/NotifyNfcTagFoundPacket';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

describe('NotifyNfcTagFoundPacket - Resilience & Edge Cases', () => {
  describe('fromPayload()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          try {
            const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
            const uidLength = payload[0];
            expect(packet.uid.length / 2).toBe(uidLength);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        })
      );
    });

    it('should correctly handle completely empty payloads', () => {
      expect(() => NotifyNfcTagFoundPacket.fromPayload(new Uint8Array(0))).toThrow(BoksProtocolError);
    });

    it('should parse specific known lengths correctly', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 4, maxLength: 10 }), (payload) => {
          try {
            const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
            const uidLength = payload[0];
            expect(packet.uid.length / 2).toBe(uidLength);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        })
      );
    });
  });
});`;
  fs.writeFileSync(testFuzz, code);
}

let bpfTest = 'tests/protocol/BoksPacketFactory.test.ts';
let codeBpf = fs.readFileSync(bpfTest, 'utf8');
// Fix checksum failures if any, wait, it says "should return undefined" in test name but the test fails because it throws an error instead of returning undefined.
// We changed createFromPayload to THROW instead of return undefined. We just need to update the tests.
codeBpf = codeBpf.replace(/expect\(\(\) => BoksPacketFactory.createFromPayload\(invalidData\)\).toThrow\(\);/g, "expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow();");
codeBpf = codeBpf.replace(/it\('should return undefined if data length is less than 3', \(\) => {/g, "it('should throw if data length is less than 3', () => {");
codeBpf = codeBpf.replace(/it\('should return undefined if data length is less than indicated by length byte', \(\) => {/g, "it('should throw if data length is less than indicated by length byte', () => {");
codeBpf = codeBpf.replace(/it\('should return undefined if checksum is invalid', \(\) => {/g, "it('should throw if checksum is invalid', () => {");
codeBpf = codeBpf.replace(/it\('should call logger and return undefined if checksum is invalid', \(\) => {/g, "it('should call logger and throw if checksum is invalid', () => {");
fs.writeFileSync(bpfTest, codeBpf);

let integTest = 'tests/integration/BoksController.simulator.test.ts';
let integCode = fs.readFileSync(integTest, 'utf8');
// "Transaction timed out after 1000ms"
// The mock simulator test `should scan for NFC tags successfully` is timing out because the dummy response checksum or structure is invalid and the factory throws, resulting in the packet not being processed and it times out waiting.
// Let's replace the simulated NFC notification packet with a valid one.
// [0xC5, length=4, 0x04(uidLen), 0x01, 0x02, 0x03, 0x04, checksum]
// 0xC5 + 4 + 4 + 1 + 2 + 3 + 4 = 197 = 0xC5
// Oh wait, 0xC5 + 0x04 + 0x04 + 0x01 + 0x02 + 0x03 + 0x04 = 217 = 0xD9
integCode = integCode.replace(
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 0xD4]);",
  "const payload = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 217]);"
);
integCode = integCode.replace(
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 0xD4]);",
  "const nfcFoundOpcode = new Uint8Array([0xC5, 0x05, 0x04, 0x01, 0x02, 0x03, 0x04, 217]);"
);
fs.writeFileSync(integTest, integCode);
