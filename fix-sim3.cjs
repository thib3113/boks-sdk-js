const fs = require('fs');

let integTest = 'tests/integration/BoksController.simulator.test.ts';
let integCode = fs.readFileSync(integTest, 'utf8');

integCode = integCode.replace(
  "setTimeout(() => simulator.simulateNfcScan('010203040506'), 10);",
  "setTimeout(() => simulator.simulateNfcScan('01020304'), 10);"
);

integCode = integCode.replace(
  "expect(result.tagId).toBe('06010203040506');",
  "expect(result.tagId).toBe('01020304');"
);

// BoksController.simulator.test.ts:
// The MAC address returned was expected to be '06010203040506', which indicates previously the length byte was just parsed as part of the bytes.
// Now `uid` is exactly `01020304`.

fs.writeFileSync(integTest, integCode);
