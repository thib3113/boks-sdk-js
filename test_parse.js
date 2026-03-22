import fs from 'fs';
import { parse } from 'acorn';

try {
  const code = fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf-8');
  parse(code, { ecmaVersion: 2022, sourceType: 'module' });
} catch(e) {
  console.log("MAPPER ACORN ERROR:");
  console.error(e);
  if(e.loc) {
     const lines = fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf-8').split('\n');
     console.log("LINE:", lines[e.loc.line - 1]);
  }
}
