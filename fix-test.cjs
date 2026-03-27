const fs = require('fs');

const file = 'tests/core/resilience/scale/SimpleScaleNotificationPackets.fuzz.test.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'if (payload.length > 0) expect(packet.errorCode).toBe(payload[0] & 0xFF);',
  'if (payload.length > 2) expect(packet.errorCode).toBe(payload[2] & 0xFF);\n        else expect(packet.errorCode).toBe(0);'
);

code = code.replace(
  'if (payload.length > 0) expect(packet.progress).toBe(payload[0]);',
  'if (payload.length > 2) expect(packet.progress).toBe(payload[2]);\n        else expect(packet.progress).toBe(0);'
);

fs.writeFileSync(file, code);
