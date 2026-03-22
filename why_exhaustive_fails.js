import fs from 'fs';
import { parse } from 'acorn';

try {
  parse(fs.readFileSync('tests/protocol/PayloadMapper.exhaustive.test.ts', 'utf-8'), { ecmaVersion: 2020, sourceType: 'module' });
  console.log("No syntax error in test file using Acorn.")
} catch(e) {
  console.log("TEST FILE ACORN ERROR:");
  console.error(e);
}
