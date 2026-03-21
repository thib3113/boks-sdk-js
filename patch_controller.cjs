const fs = require('fs');

let content = fs.readFileSync('src/client/BoksController.ts', 'utf8');
content = content.replace(
  "const partA = keyBytes.subarray(0, 16);",
  "const partA = bytesToHex(keyBytes.subarray(0, 16)).toUpperCase();"
);
content = content.replace(
  "const partB = keyBytes.subarray(16, 32);",
  "const partB = bytesToHex(keyBytes.subarray(16, 32)).toUpperCase();"
);

if (!content.includes('bytesToHex')) {
  content = content.replace(
    "import { hexToBytes, parseHex } from '@/utils/converters';",
    "import { hexToBytes, parseHex, bytesToHex } from '@/utils/converters';"
  );
} else {
  content = content.replace(
    "import { hexToBytes, parseHex } from '@/utils/converters';",
    "import { hexToBytes, parseHex, bytesToHex } from '@/utils/converters';"
  );
}

fs.writeFileSync('src/client/BoksController.ts', content);
