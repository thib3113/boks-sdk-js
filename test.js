const { execSync } = require('child_process');
const output = execSync('git log --oneline').toString().split('\n');
console.log(output.slice(0, 15).join('\n'));
