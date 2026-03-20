const fs = require('fs');
let content = fs.readFileSync('src/protocol/BoksPacketFactory.ts', 'utf8');

// Fix "List of all supported packet classes." to reflect it's now just base RX packets
content = content.replace(
  /\/\*\*\n \* List of all supported packet classes\.\n \* We use an array and map it to a registry for cleaner management\.\n \*\//m,
  `/**
 * List of base RX (Notification) packet classes.
 * These are pre-registered because the client needs them to parse incoming data.
 * Other packets (like TX commands) can be dynamically registered via \`BoksPacketFactory.register()\`.
 */`
);

// Fix the JSDoc issue for register / createFromPayload
const originalMethods = `  /**
   * Creates a packet instance from a full raw Bluetooth payload.
   * Expected format: [Opcode, Length, ...Payload, Checksum]
   */
  /**
   * Register an additional packet dynamically. Useful for Simulator.
   */
  static register(ctor: BoksPacketConstructor): void {
    if (ctor && ctor.opcode !== undefined) {
      this.registry[ctor.opcode] = ctor;
    }
  }

  static createFromPayload(`;

const fixedMethods = `  /**
   * Register an additional packet dynamically. Useful for Simulator or dynamically injected TX commands.
   */
  static register(ctor: BoksPacketConstructor): void {
    if (ctor && ctor.opcode !== undefined) {
      this.registry[ctor.opcode] = ctor;
    }
  }

  /**
   * Creates a packet instance from a full raw Bluetooth payload.
   * Expected format: [Opcode, Length, ...Payload, Checksum]
   */
  static createFromPayload(`;

content = content.replace(originalMethods, fixedMethods);

// Finally, there's a dangling "// Scale" at the top of the file
content = content.replace(/\/\/ Scale\n\n\/\/ Scale Notifications\n/, '// Scale Notifications\n');

fs.writeFileSync('src/protocol/BoksPacketFactory.ts', content, 'utf8');
