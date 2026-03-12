const fs = require('fs');

let t1 = 'tests/protocol/BoksPacketFactory.test.ts';
let c1 = fs.readFileSync(t1, 'utf8');

c1 = c1.replace(
  "{ name: 'NotifyNfcTagFoundPacket', class: Packets.NotifyNfcTagFoundPacket, payload: new Uint8Array([0x01]) },",
  "{ name: 'NotifyNfcTagFoundPacket', class: Packets.NotifyNfcTagFoundPacket, payload: new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04]) },"
);

fs.writeFileSync(t1, c1);
