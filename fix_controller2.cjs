const fs = require('fs');

let controllerFile = 'src/client/BoksController.ts';
let code = fs.readFileSync(controllerFile, 'utf8');

code = code.replace(/new ScaleTareEmptyPacket\(new Uint8Array\(0\)\)/g, "new ScaleTareEmptyPacket()");
code = code.replace(/new ScaleMeasureWeightPacket\(new Uint8Array\(0\)\)/g, "new ScaleMeasureWeightPacket()");

fs.writeFileSync(controllerFile, code);
