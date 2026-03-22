// If `PayloadMapper.ts` and `PayloadNfcUid.ts` do not have syntax errors, what else did I modify?
// `src/utils/converters.ts` -> Tested, runs perfectly!
// `src/simulator/BoksSimulator.ts` -> Not imported here!
// `tests/...` -> Not imported!
// There is absolutely no reason `tests/protocol/PayloadMapper.exhaustive.test.ts` should throw a syntax error unless:
// 1. My JIT template code has a syntax error AND it executes at LOAD time for some reason (e.g. `defineSchema` in top-level).
// Exhaustive test DOES evaluate JIT at load time via decorators!!!
// Look at ExhaustiveTestPacket: `@PayloadUint8(0) public accessor u8!: number;` -> This executes `defineSchema`.
// Then, DOES it compile the parsers immediately?
// NO, `parse` and `serialize` are lazy.
// Wait, `PayloadMapper` static fields? `compiledParsers = new WeakMap()`
// Wait, if `defineSchema` is called, it might call `compileParser` eagerly in some branch?
// No: "parser = this.compileParser(targetClass as PayloadConstructor);" inside `parse()`.

import fs from 'fs';
const pm = fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf-8');

const regex = /new Function\([\s\S]*?fnBody[\s\S]*?\)/g;
let match;
let i = 1;
while((match = regex.exec(pm)) !== null) {
   console.log("Found Function Constructor", i++, ":", match[0].substring(0, 100));
}
