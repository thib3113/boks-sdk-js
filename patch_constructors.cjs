const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(dir + '/' + file);
    if (stat.isDirectory()) {
      fileList = getFiles(dir + '/' + file, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(dir + '/' + file);
    }
  }
  return fileList;
}

const dirs = ['src/protocol/uplink', 'src/protocol/downlink', 'src/protocol/scale'];
let allFiles = [];
for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(getFiles(dir));
  }
}

for (const file of allFiles) {
  let code = fs.readFileSync(file, 'utf8');
  let original = code;

  // Regex to match the constructor parameters. We match from `constructor(` to the closing parenthesis before `{`.
  const constructorRegex = /constructor\s*\(([^)]*)\)\s*(?=\{)/g;

  code = code.replace(constructorRegex, (match, p1) => {
    // p1 is the parameter string. E.g., `age: number = 0, rawPayload?: Uint8Array`
    // We strip defaults: `= 0`, `= ''`, `= false`, `= EMPTY_BUFFER`
    // Also change `rawPayload?: Uint8Array` to `rawPayload?: Uint8Array` -- wait, default parameters don't strictly require modifying optional `?`.
    // We only remove default assignments here.

    let newParams = p1
      .replace(/\s*=\s*''/g, '')
      .replace(/\s*=\s*0/g, '')
      .replace(/\s*=\s*false/g, '')
      .replace(/\s*=\s*EMPTY_BUFFER/g, '');

    return `constructor(${newParams})`;
  });

  if (code !== original) {
    fs.writeFileSync(file, code);
    console.log(`Patched ${file}`);
  }
}
