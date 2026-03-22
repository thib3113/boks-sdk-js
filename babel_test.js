import fs from 'fs';
import { parse } from '@babel/parser';

try {
  const code = fs.readFileSync('tests/protocol/PayloadMapper.exhaustive.test.ts', 'utf-8');
  parse(code, { sourceType: 'module', plugins: ['typescript', 'decorators-legacy'] });
  console.log("No syntax error in test file with babel.");
} catch(e) {
  console.log("TEST FILE BABEL ERROR:");
  console.error(e);
}
