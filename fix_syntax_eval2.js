import fs from 'fs';

const content = fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf-8');

// The issue IS IN PayloadMapper.ts source. Wait, `acorn` parsed the *original* PayloadMapper.ts with a SyntaxError as well?!
// Let's run acorn parse on the ORIGINAL PayloadMapper.ts.
