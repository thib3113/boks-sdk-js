const fs = require('fs');

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = dir + '/' + dirent.name;
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

const files = getFiles('src/protocol').filter(f => f.endsWith('.ts'));

for (let file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Due to my aggressive `remove_constructors.cjs` I might have removed:
  // constructor(raw?: Uint8Array) {
  //   super(NotifySomePacket.opcode, raw);
  // }
  // Wait, I DID look for that! I used regex:
  // /^\s*constructor\(raw\?: Uint8Array\) \{\s*super\([A-Za-z0-9_]+\.opcode, raw\);\s*\}\s*$/m;
  // If I removed this, then `new Packet(payload)` would use `BoksRXPacket` constructor `constructor(opcode, raw)`.
  // If we pass `payload` (a Uint8Array) as the first argument to `new Packet(payload)`,
  // it gets passed as `opcode`!
  // And `opcode` is a number!
  // So `this._opcode` becomes `payload`, and `expect(packet.opcode).toBe(0xc2)` fails because it's a Uint8Array. Wait, why did it say +0 instead of Uint8Array?
  // Because `payload` could be `Uint8Array [0, ...]` and `toBe` might have compared `0`? No, `expected +0 to be 194`.
}
