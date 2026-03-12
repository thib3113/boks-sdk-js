const fs = require('fs');

let testFile = 'tests/protocol/BoksPacketFactory.test.ts';
let code = fs.readFileSync(testFile, 'utf8');

// ReferenceError: BoksProtocolError is not defined
// We didn't import it in BoksPacketFactory.test.ts. We must import BoksProtocolError.
if (!code.includes("import { BoksProtocolError }")) {
  code = code.replace("import { BoksOpcode } from '@/protocol/constants';", "import { BoksOpcode } from '@/protocol/constants';\nimport { BoksProtocolError } from '@/errors/BoksProtocolError';");
}

// "should throw if data length is less than indicated by length byte" (outside the describe block)
code = code.replace(
  `expect(BoksPacketFactory.createFromPayload(data)).toBeUndefined();`,
  `expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(BoksProtocolError);`
);

code = code.replace(
  `expect(BoksPacketFactory.createFromPayload(data)).toBeUndefined();`,
  `expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(BoksProtocolError);`
);

code = code.replace(
  `const packet = BoksPacketFactory.createFromPayload(data, logger);

      expect(packet).toBeUndefined();`,
  `expect(() => BoksPacketFactory.createFromPayload(data, logger)).toThrow(BoksProtocolError);`
);

fs.writeFileSync(testFile, code);

// NotifyNfcTagFoundPacket failing on BoksPacketFactory test. "Payload too short for specified UID length".
// 0xC5 + 4-byte payload. So it expects length = 4. 0x04.
// My test case: { opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload: new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]), expectedClass: 'NotifyNfcTagFoundPacket' },
// payload: [4, 1, 2, 3, 4] -> length 5
// Let's make sure it's 5. length=5. Wait, it failed. Let's see the error.
// `if (payload.length < 1 + uidLength)`
// Here length is 5. `payload` = `[4, 1, 2, 3, 4]`.
// Wait! `dataWithoutChecksum.set(payload, 2)` where `dataWithoutChecksum[1] = payload.length`.
// If it fails, maybe `payload` is sliced wrong? No, BoksPacketFactory slices `data.subarray(2, 2 + length)`.
// If length is 5, subarray is 2 to 7. The payload passed to `fromPayload` is length 5.
// Why did it say "Payload too short"?
// "length: 5, expected: 1 + 4 = 5"? If `payload.length < 1 + uidLength`, `5 < 5` is false!
// Wait, maybe the old code had `[0x01, 0x02, 0x03, 0x04]`, and the length was 4?
// Let me just verify BoksPacketFactory.test.ts has exactly what I put.
