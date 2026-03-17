const fs = require('fs');

const path = 'tests/protocol/resilience/payload-mapper.security.test.ts';
let code = fs.readFileSync(path, 'utf8');

// The replacement logic:
const parserSearchStr = `        {
          expected: BoksExpectedReason.NUMBER,
          received: '1); throw new Error("hacked parser"); //'
        }`;

const parserReplaceStr = `        {
          field: 'malicious',
          expected: BoksExpectedReason.NUMBER,
          received: '1); throw new Error("hacked parser"); //'
        }`;

code = code.replace(parserSearchStr, parserReplaceStr);

const serializerSearchStr = `        {
          expected: BoksExpectedReason.NUMBER,
          received: '1); throw new Error("hacked serializer"); //'
        }`;

const serializerReplaceStr = `        {
          field: 'malicious',
          expected: BoksExpectedReason.NUMBER,
          received: '1); throw new Error("hacked serializer"); //'
        }`;

code = code.replace(serializerSearchStr, serializerReplaceStr);

fs.writeFileSync(path, code);
