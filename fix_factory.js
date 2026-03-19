const fs = require('fs');

let fileContent = fs.readFileSync('src/protocol/BoksPacketFactory.ts', 'utf8');

// 1. Enlever les imports Downlink et Scale Commands (y compris RegeneratePartAPacket et RegeneratePartBPacket)
fileContent = fileContent.replace(/\/\/ Downlink[\s\S]*?\/\/ Scale Commands[\s\S]*?\/\/ Scale Notifications/m, '// Scale Notifications');

// 2. Nettoyer le tableau PACKET_CLASSES
fileContent = fileContent.replace(/const PACKET_CLASSES: BoksPacketConstructor\[\] = \[[\s\S]*?\/\/ Scale Notifications/m, 'const PACKET_CLASSES: BoksPacketConstructor[] = [\n  // Scale Notifications');

// 3. Modifier RegeneratePartAPacket et RegeneratePartBPacket qui étaient importés pour le type de retour
fileContent = fileContent.replace(/import { RegeneratePartAPacket } from '.*?';\n/g, '');
fileContent = fileContent.replace(/import { RegeneratePartBPacket } from '.*?';\n/g, '');

fileContent = fileContent.replace(/static createRegeneratePackets\([\s\S]*?\): \[RegeneratePartAPacket, RegeneratePartBPacket\] \{/, `static createRegeneratePackets(
    configKey: string,
    newMasterKey: Uint8Array | string
  ): [any, any] {`);

fileContent = fileContent.replace(/new RegeneratePartAPacket/g, `new (this.getConstructor(0x56) || function() { throw new Error('RegeneratePartAPacket not registered') }) as any`);
fileContent = fileContent.replace(/new RegeneratePartBPacket/g, `new (this.getConstructor(0x57) || function() { throw new Error('RegeneratePartBPacket not registered') }) as any`);

// 4. Ajouter la méthode register
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
