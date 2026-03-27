const fs = require('fs');
let code = fs.readFileSync('src/protocol/decorators/PayloadAnalyzer.ts', 'utf8');

code = code.replace(/val: any/g, 'val: unknown');
code = code.replace(/src: any/g, 'src: unknown');
code = code.replace(/macVal: any/g, 'macVal: unknown');
code = code.replace(/hexVal: any/g, 'hexVal: unknown');
code = code.replace(/FF/g, 'ff');

fs.writeFileSync('src/protocol/decorators/PayloadAnalyzer.ts', code);
