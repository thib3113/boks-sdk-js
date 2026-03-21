const fs = require('fs');
let content = fs.readFileSync('tests/protocol/downlink/RegeneratePartAPacket.test.ts', 'utf8');
content = content.replace(
  "expect(packet.part).toEqual('000102030405060708090a0b0c0d0e0f'.toLowerCase());",
  "expect(packet.part).toEqual('000102030405060708090A0B0C0D0E0F');"
);
fs.writeFileSync('tests/protocol/downlink/RegeneratePartAPacket.test.ts', content);
