const fs = require('fs');

let controllerFile = 'src/client/BoksController.ts';
let code = fs.readFileSync(controllerFile, 'utf8');

code = code.replace(/new ScaleBondPacket\(\)/g, "new ScaleBondPacket(new Uint8Array(0))");
code = code.replace(/new ScaleTareLoadedPacket\(\)/g, "new ScaleTareLoadedPacket(new Uint8Array(0))");
code = code.replace(/new ScaleTareEmptyPacket\(\)/g, "new ScaleTareEmptyPacket(new Uint8Array(0))");
code = code.replace(/new ScaleMeasureWeightPacket\(\)/g, "new ScaleMeasureWeightPacket(new Uint8Array(0))");

fs.writeFileSync(controllerFile, code);
