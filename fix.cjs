const fs = require('fs');

const path = 'src/protocol/decorators/PayloadMapper.ts';
let code = fs.readFileSync(path, 'utf8');

// The replacement logic:
const parserSearchStr = `for (const field of fields) {
      const o = field.offset;
      const prop = field.propertyName;

      switch (field.type) {`;

const parserReplaceStr = `for (const field of fields) {
      const o = field.offset;
      const prop = field.propertyName;

      if (field.type === 'bit') {
        if (typeof field.bitIndex !== 'number' || field.bitIndex < 0 || field.bitIndex > 7) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INTERNAL_ERROR,
            \`Invalid bitIndex: \${field.bitIndex} for property \${prop}\`,
            { field: prop, received: field.bitIndex, expected: BoksExpectedReason.NUMBER }
          );
        }
      }

      switch (field.type) {`;

code = code.replace(parserSearchStr, parserReplaceStr);

const serializerSearchStr = `for (const field of fields) {
      const o = field.offset;
      const prop = field.propertyName;
      // We read the instance value. Missing values default to 0 for numbers, or empty string.

      // Throw if mandatory fields are missing`;

const serializerReplaceStr = `for (const field of fields) {
      const o = field.offset;
      const prop = field.propertyName;

      if (field.type === 'bit') {
        if (typeof field.bitIndex !== 'number' || field.bitIndex < 0 || field.bitIndex > 7) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INTERNAL_ERROR,
            \`Invalid bitIndex: \${field.bitIndex} for property \${prop}\`,
            { field: prop, received: field.bitIndex, expected: BoksExpectedReason.NUMBER }
          );
        }
      }

      // We read the instance value. Missing values default to 0 for numbers, or empty string.

      // Throw if mandatory fields are missing`;

code = code.replace(serializerSearchStr, serializerReplaceStr);

fs.writeFileSync(path, code);
