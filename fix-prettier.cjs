const fs = require('fs');

let file = 'src/protocol/payload-mapper.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "throw new BoksProtocolError(BoksProtocolErrorId.INTERNAL_ERROR, 'Cannot serialize instance without constructor');",
  "throw new BoksProtocolError(\n      BoksProtocolErrorId.INTERNAL_ERROR,\n      'Cannot serialize instance without constructor'\n    );"
);

fs.writeFileSync(file, code);
