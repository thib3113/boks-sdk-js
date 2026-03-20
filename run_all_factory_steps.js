const fs = require('fs');

let fileContent = fs.readFileSync('src/protocol/BoksPacketFactory.ts', 'utf8');

// 1. Remove Downlink / Scale Commands (Tree-Shaking Optimization)
fileContent = fileContent.replace(/\/\/ Downlink[\s\S]*?\/\/ Scale Commands[\s\S]*?\/\/ Scale Notifications/m, '// Scale Notifications');

// 2. Remove RegeneratePartA/B imports
fileContent = fileContent.replace(/import \{ RegeneratePartAPacket \} from '.*?';\n/g, '');
fileContent = fileContent.replace(/import \{ RegeneratePartBPacket \} from '.*?';\n/g, '');
const importsToRemove = [
  'OpenDoorPacket', 'AskDoorStatusPacket', 'RequestLogsPacket', 'RebootPacket',
  'GetLogsCountPacket', 'TestBatteryPacket', 'MasterCodeEditPacket',
  'SingleToMultiCodePacket', 'MultiToSingleCodePacket', 'DeleteMasterCodePacket',
  'DeleteSingleUseCodePacket', 'DeleteMultiUseCodePacket', 'ReactivateCodePacket',
  'GenerateCodesPacket', 'CreateMasterCodePacket', 'CreateSingleUseCodePacket',
  'CreateMultiUseCodePacket', 'CountCodesPacket', 'GenerateCodesSupportPacket',
  'SetConfigurationPacket', 'RegisterNfcTagScanStartPacket', 'NfcRegisterPacket',
  'UnregisterNfcTagPacket', 'RegeneratePartAPacket', 'RegeneratePartBPacket',
  'ScaleBondPacket', 'ScaleGetMacPacket', 'ScaleForgetPacket', 'ScaleTareEmptyPacket',
  'ScaleTareLoadedPacket', 'ScaleMeasureWeightPacket', 'ScalePrepareDfuPacket',
  'ScaleGetRawSensorsPacket', 'ScaleReconnectPacket'
];
for (const toRemove of importsToRemove) {
    const regex = new RegExp(`import \\{ ${toRemove} \\} from '.*?';\\n`, 'g');
    fileContent = fileContent.replace(regex, '');
}

// 3. Remove createRegeneratePackets completely
fileContent = fileContent.replace(/\/\*\*[\s\S]*?Helper to create regeneration packets[\s\S]*?\}\s*\}$/m, '}');

// 4. Clean up PACKET_CLASSES
fileContent = fileContent.replace(/const PACKET_CLASSES: BoksPacketConstructor\[\] = \[[\s\S]*?\/\/ Scale Notifications/m, 'const PACKET_CLASSES: BoksPacketConstructor[] = [\n  // Scale Notifications');


// 5. Add register method
fileContent = fileContent.replace(/private static readonly registry: \(BoksPacketConstructor \| undefined\)\[\] = \(\(\) => \{/, `private static readonly registry: (BoksPacketConstructor | undefined)[] = (() => {`);

fileContent = fileContent.replace(/static createFromPayload/, `/**
   * Register an additional packet dynamically. Useful for Simulator.
   */
  static register(ctor: BoksPacketConstructor): void {
    if (ctor && ctor.opcode !== undefined) {
      this.registry[ctor.opcode] = ctor;
    }
  }

  static createFromPayload`);


fs.writeFileSync('src/protocol/BoksPacketFactory.ts', fileContent, 'utf8');
