const fs = require('fs');

let config = fs.readFileSync('eslint.config.js', 'utf8');

// I need to add an exception for PayloadAnalyzer for prettier
config = config.replace(/files: \['src\/protocol\/constants\.ts'\]/g, "files: ['src/protocol/constants.ts', 'src/protocol/decorators/PayloadAnalyzer.ts']");

fs.writeFileSync('eslint.config.js', config);
