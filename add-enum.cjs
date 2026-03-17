const fs = require('fs');

const path = 'src/errors/BoksExpectedReason.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /BUFFER_SIZE = 'BUFFER_SIZE'/,
  "BUFFER_SIZE = 'BUFFER_SIZE',\n  BIT_INDEX = 'BIT_INDEX'"
);

fs.writeFileSync(path, code);
