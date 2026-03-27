const fs = require('fs');
let code = fs.readFileSync('src/protocol/decorators/PayloadMapper.ts', 'utf8');

// I notice:
// `result['${prop}'] = analyzer.readAsciiString(payload, ${o}, ${field.length});\n`
// If field.length is a string like "1; console.log('HACKED');", JS engine throws SyntaxError on parsing `new Function`
// This is exactly the fuzz test: "should reject hex_string with malicious string length injection by falling back to dynamic size without crash or eval"
// Ah, the test injects a string into field.length.
// Let's use `typeof field.length === 'number' ? field.length : 'undefined'` to avoid syntax errors inside the JIT.

code = code.replace(/\$\{field\.length\}/g, `\${typeof field.length === 'number' ? field.length : 'undefined'}`);

fs.writeFileSync('src/protocol/decorators/PayloadMapper.ts', code);
