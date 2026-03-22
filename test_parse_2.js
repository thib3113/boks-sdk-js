import { readFileSync } from 'fs';
import { parse } from '@babel/parser';

try {
  const code = readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf-8');
  parse(code, { sourceType: 'module', plugins: ['typescript'] });
  console.log("No syntax error in mapper with babel");
} catch(e) {
  console.log("MAPPER BABEL ERROR:");
  console.error(e);
}
