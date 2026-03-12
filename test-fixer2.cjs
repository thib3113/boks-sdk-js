const fs = require('fs');

let testFile = 'tests/protocol/BoksPacketFactory.test.ts';
let code = fs.readFileSync(testFile, 'utf8');

// I am pretty sure `import { BoksProtocolError } from '@/errors/BoksProtocolError';` is correctly structured now, let's verify.
if (code.includes("import { BoksOpcode } from '@/protocol/constants';\nimport { BoksProtocolError } from '@/errors/BoksProtocolError';")) {
  // good
} else if (!code.includes("import { BoksProtocolError }")) {
  code = code.replace("import { BoksOpcode } from '@/protocol/constants';", "import { BoksOpcode } from '@/protocol/constants';\nimport { BoksProtocolError } from '@/errors/BoksProtocolError';");
}

// "Payload too short for specified UID length" for NotifyNfcTagFoundPacket.
// My fix data: `[0x04, 0x01, 0x02, 0x03, 0x04]` -> Length is 5.
// Ah, `dataWithoutChecksum.set(payload, 2);`
// `length` var is 5.
// `dataWithoutChecksum` is size 7.
// Subarray payload in `fromPayload` is `data.subarray(2, 2 + length)`. That's length 5.
// `if (payload.length < 1 + uidLength)`
// `payload.length` is 5. `uidLength` is `payload[0]` which is `0x04` = 4.
// `5 < 1 + 4` -> `5 < 5` is false!
// Why is it failing with "Payload too short for specified UID length"?
// Wait, maybe `dataWithoutChecksum.length` is calculated differently.
// Let's change it to `[0x04, 0x01, 0x02, 0x03, 0x04]` and the error is actually from ANOTHER test! Wait!
// "tests/protocol/BoksPacketFactory.test.ts > BoksPacketFactory > createFromPayload with it.each > should create 'NotifyNfcTagFoundPacket' from payload"
// Wait! `tests/protocol/BoksPacketFactory.test.ts:110:40`
// Oh, `expectedClass` loop test might be using the wrong array. Let me double check if there are multiple occurrences of NOTIFY_NFC_TAG_FOUND in `testCases`.
// Ah, `NotifyNfcTagFoundPacket` test case in BoksPacketFactory:
// `{ name: 'NotifyNfcTagFoundPacket', class: Packets.NotifyNfcTagFoundPacket, payload: new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]) }`
// The error trace says:
// `Function.fromPayload src/protocol/uplink/NotifyNfcTagFoundPacket.ts:37:13`
// Let's inspect `NotifyNfcTagFoundPacket.ts`.

fs.writeFileSync(testFile, code);
