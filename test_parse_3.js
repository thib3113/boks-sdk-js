import fs from 'fs';
import { parse } from 'acorn';
// IF my earlier change did NOT touch Exhaustive, why is it failing?
// The Acorn error:
//  SyntaxError: Unexpected character '@' (23:2)
// Means it can't parse decorators.
// BUT why was it parsing them BEFORE?
// Wait, `vitest run tests/protocol/PayloadMapper.exhaustive.test.ts` compiles the file through Vite.
// If Vite fails to parse `@` it means TS decorator support in Vite got broken.
// Is it because `tsconfig.json` changed?
