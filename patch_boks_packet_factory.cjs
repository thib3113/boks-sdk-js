const fs = require('fs');

let file = 'src/protocol/BoksPacketFactory.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "if (data.length < 3) {\n      return undefined;\n    }",
  "if (data.length < 3) {\n      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH, 'Packet length too short (needs at least 3 bytes)', { received: data.length });\n    }"
);

code = code.replace(
  "if (data.length < length + 3) {\n      return undefined;\n    }",
  "if (data.length < length + 3) {\n      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH, 'Packet length too short based on length byte', { received: data.length, expected: length + 3 });\n    }"
);

code = code.replace(
  /if \(checksum !== computedChecksum\) \{\s*if \(logger\) \{\s*logger\('warn', 'checksum_error', \{\s*opcode,\s*expected: computedChecksum,\s*received: checksum\s*\}\);\s*\}\s*return undefined;\s*\}/g,
  `if (checksum !== computedChecksum) {
      if (logger) {
        logger('warn', 'checksum_error', {
          opcode,
          expected: computedChecksum,
          received: checksum
        });
      }
      throw new BoksProtocolError(BoksProtocolErrorId.CHECKSUM_MISMATCH, 'Invalid checksum', { expected: computedChecksum, received: checksum });
    }`
);

fs.writeFileSync(file, code);
