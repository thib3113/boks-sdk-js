const fs = require('fs');

function revert(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('part: Uint8Array | string;', 'part: string;');
  content = content.replace('public accessor part!: Uint8Array | string;', 'public accessor part!: string;');
  fs.writeFileSync(file, content);
}

revert('src/protocol/downlink/RegeneratePartAPacket.ts');
revert('src/protocol/downlink/RegeneratePartBPacket.ts');
