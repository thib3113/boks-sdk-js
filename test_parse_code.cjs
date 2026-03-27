const fs = require('fs');

let mapperCode = fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf8');

let pStart = mapperCode.indexOf('private static compileParser');
let vStart = mapperCode.indexOf('private static compileValidator');

let parserChunk = mapperCode.substring(pStart, vStart);
console.log(parserChunk);
