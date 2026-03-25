const fs = require('fs');

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = dir + '/' + dirent.name;
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

const files = getFiles('tests/protocol/uplink/history').filter(f => f.endsWith('.test.ts'));

for (let file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (code.includes('should retain the exact raw payload when constructed from hex via factory')) {
    // Some classes use BoksPacketFactory.fromHex, but there is no BoksPacketFactory if it's not imported correctly,
    // Wait, BoksPacketFactory.fromHex does not exist? Ah, the factory's static method is `fromHex`, wait.
    // Let me check BoksPacketFactory.
  }
}
