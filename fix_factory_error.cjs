const fs = require('fs');

// Add CHECKSUM_MISMATCH to BoksProtocolErrorId enum
let errorFile = 'src/errors/BoksProtocolError.ts';
let code = fs.readFileSync(errorFile, 'utf8');
code = code.replace(
  "INTERNAL_ERROR = 'INTERNAL_ERROR'\n}",
  "INTERNAL_ERROR = 'INTERNAL_ERROR',\n  CHECKSUM_MISMATCH = 'CHECKSUM_MISMATCH'\n}"
);
fs.writeFileSync(errorFile, code);
