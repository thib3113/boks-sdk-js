const fs = require('fs');

const boksStorePath = 'wiki/.vitepress/boksStore.ts';
let code = fs.readFileSync(boksStorePath, 'utf8');

// Ensure bytesToHex is imported
if (!code.includes('bytesToHex')) {
  code = code.replace("import { BoksCodeType, BoksOpcode } from '../../src/protocol/constants';",
      "import { BoksCodeType, BoksOpcode } from '../../src/protocol/constants';\nimport { bytesToHex } from '../../src/utils/converters';");
}

// Modify exportLogs
const exportLogsRegex = /exportLogs\(\) \{[\s\S]*?const dataStr = JSON\.stringify\(exportedLogs, null, 2\);/;

const newExportLogs = `exportLogs() {
    if (typeof document === 'undefined') return;
    const exportedLogs = this.packetLogs.map(log => {
      let packetData;
      let rawPayloadHex;

      if (log.rawData) {
        packetData = log.rawData.toJSON ? log.rawData.toJSON() : JSON.parse(JSON.stringify(log.rawData));
        if (log.rawData.rawPayload) {
          rawPayloadHex = bytesToHex(log.rawData.rawPayload);
        }
      }

      if (packetData && typeof packetData === 'object') {
        delete packetData.opcode;
      }
      return {
        time: log.time,
        direction: log.direction,
        opcode: log.opcode,
        name: log.name,
        length: log.length,
        data: packetData,
        rawPayload: rawPayloadHex
      };
    });
    const dataStr = JSON.stringify(exportedLogs, null, 2);`;

code = code.replace(exportLogsRegex, newExportLogs);

fs.writeFileSync(boksStorePath, code);
