const fs = require('fs');

let file = 'tests/protocol/BoksPacketFactory.test.ts';
let code = fs.readFileSync(file, 'utf8');

// There is an extra `});` around line 219. I'll just remove the last line if it's just `});`.
// Actually let's just do a clean regex removal of the last `});`.
const lines = code.split('\n');
while(lines.length > 0 && lines[lines.length - 1].trim() !== '});') {
  lines.pop();
}
// Pop one more if it's an extra one.
// Let's just find where it's unbalanced. It's much simpler to just use an AST parser or count braces, but I can just manually strip the extra '});' from the end of the file.

// A quick count:
let open = (code.match(/\{/g) || []).length;
let close = (code.match(/\}/g) || []).length;
console.log('Open:', open, 'Close:', close);
