const fs = require('fs');

// Fix BoksController.ts
let controllerFile = 'src/client/BoksController.ts';
let code = fs.readFileSync(controllerFile, 'utf8');
code = code.replace(/await this\.sendScaleCommand\(new ScaleTareLoadedPacket\(\)\);/g, "await this.sendScaleCommand(new ScaleTareLoadedPacket(new Uint8Array(0)));");
code = code.replace(/await this\.sendScaleCommand\(new ScaleBondPacket\(\)\);/g, "await this.sendScaleCommand(new ScaleBondPacket(new Uint8Array(0)));");
fs.writeFileSync(controllerFile, code);

// Fix unused EMPTY_BUFFER
const filesToClean = [
  'src/protocol/scale/NotifyScaleFaultyPacket.ts',
  'src/protocol/scale/NotifyScaleRawSensorsPacket.ts',
  'src/protocol/scale/ScaleBondPacket.ts',
  'src/protocol/scale/ScaleTareLoadedPacket.ts'
];

for(const f of filesToClean) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import { BoksOpcode, EMPTY_BUFFER }/g, "import { BoksOpcode }");
  c = c.replace(/import { EMPTY_BUFFER, BoksOpcode }/g, "import { BoksOpcode }");
  fs.writeFileSync(f, c);
}

// Fix tests
function replaceConstructorCalls(file, className, args) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = new RegExp(`new ${className}\\(\\)`, 'g');
    content = content.replace(regex, `new ${className}(${args})`);
    fs.writeFileSync(file, content);
  }
}

replaceConstructorCalls('tests/protocol/uplink/history/BleRebootHistoryPacket.test.ts', 'BleRebootHistoryPacket', '0');
replaceConstructorCalls('tests/protocol/uplink/history/BlockResetHistoryPacket.test.ts', 'BlockResetHistoryPacket', '0');
replaceConstructorCalls('tests/protocol/uplink/history/DoorCloseHistoryPacket.test.ts', 'DoorCloseHistoryPacket', '0');
replaceConstructorCalls('tests/protocol/uplink/history/ErrorHistoryPacket.test.ts', 'ErrorHistoryPacket', '0, 0');
replaceConstructorCalls('tests/protocol/uplink/history/HistoryEraseHistoryPacket.test.ts', 'HistoryEraseHistoryPacket', '0');
replaceConstructorCalls('tests/protocol/uplink/history/KeyOpeningHistoryPacket.test.ts', 'KeyOpeningHistoryPacket', '0');
replaceConstructorCalls('tests/protocol/uplink/history/NfcOpeningHistoryPacket.test.ts', 'NfcOpeningHistoryPacket', "0, 0, ''");
replaceConstructorCalls('tests/protocol/uplink/history/NfcRegisteringHistoryPacket.test.ts', 'NfcRegisteringHistoryPacket', '0, new Uint8Array(0)');
replaceConstructorCalls('tests/protocol/uplink/history/PowerOffHistoryPacket.test.ts', 'PowerOffHistoryPacket', '0, 0');
replaceConstructorCalls('tests/protocol/uplink/history/PowerOnHistoryPacket.test.ts', 'PowerOnHistoryPacket', '0');
replaceConstructorCalls('tests/protocol/uplink/history/ScaleMeasureHistoryPacket.test.ts', 'ScaleMeasureHistoryPacket', '0, new Uint8Array(0)');
