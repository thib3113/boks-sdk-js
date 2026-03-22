// If PayloadMapperJit.test.ts passes, BUT PayloadMapper.exhaustive.test.ts fails WITH SyntaxError.
// The exhaustive test imports decorators directly:
// import { PayloadMapper, PayloadUint8, ... } from '@/protocol/decorators';
// PayloadMapperJit.test.ts DOES NOT import decorators directly! It only imports PayloadMapper and builds it manually using `PayloadMapper.defineSchema`.
// So the syntax error is IN THE DECORATORS parsing itself!!!
// `@PayloadUint8(0) public accessor u8!: number;`
// This uses TS Stage 3/ECMAScript decorators!
// Why did decorators stop working?
// Vite transpiles decorators natively since 5.0 with esbuild, BUT `vitest.config.ts` has a specific configuration!
import fs from 'fs';
console.log(fs.readFileSync('vitest.config.ts', 'utf-8'));
