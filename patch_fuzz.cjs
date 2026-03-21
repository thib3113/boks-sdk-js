const fs = require('fs');

function update(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { bytesToHex }')) {
    content = "import { bytesToHex } from '../../../src/utils/converters';\n" + content;
  }
  fs.writeFileSync(file, content);
}

update('tests/core/resilience/RegeneratePartAPacket.fuzz.test.ts');
update('tests/core/resilience/RegeneratePartBPacket.fuzz.test.ts');
