import { parse } from 'acorn';
import fs from 'fs';

try {
  parse(fs.readFileSync('tests/protocol/PayloadMapper.exhaustive.test.ts', 'utf-8'), { ecmaVersion: 2020, sourceType: 'module' });
} catch(e) {
  console.log("TEST FILE:");
  console.error(e);
}

try {
  parse(fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf-8'), { ecmaVersion: 2020, sourceType: 'module' });
} catch(e) {
  console.log("MAPPER:");
  console.error(e);
}
