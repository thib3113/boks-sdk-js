const fs = require('fs');

// Ah, wait! The fromPayload expects `uidLength` to be equal to or less than `payload.length - 1`.
// Our payload is [4, 1, 2, 3, 4] and it is size 5.
// `uidLength` is 4.
// `payload.length` is 5.
// `if (payload.length < 1 + uidLength)` means `5 < 1 + 4`, i.e., `5 < 5`, which is FALSE. So it should NOT throw.
// Wait! `[4, 1, 2, 3, 4]` length is 5.
// 5 < 5 is false. So it shouldn't throw!
// Let me look at `NotifyNfcTagFoundPacket.ts:37`

let file = 'src/protocol/uplink/NotifyNfcTagFoundPacket.ts';
let code = fs.readFileSync(file, 'utf8');

console.log(code);
