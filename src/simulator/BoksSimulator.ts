import { BoksOpcode, BoksCodeType, BOKS_UUIDS, EMPTY_BUFFER } from '../protocol/constants';
import {
  calculateChecksum,
  readConfigKeyFromBuffer,
  readPinFromBuffer,
  bytesToHex,
  bytesToMac,
  stringToBytes,
  hexToBytes
} from '../utils/converters';
import { precomputeBoksKeyContext, generateBoksPinFromContext } from '../crypto/pin-algorithm';
import { BoksPacket } from '../protocol/_BoksPacketBase';
import { BoksPacketFactory } from '../protocol/BoksPacketFactory';

/**
 * Represents a GATT Characteristic structure for simulation.
 */
export interface SimulatedCharacteristic {
  uuid: string;
  properties: ('read' | 'write' | 'notify' | 'writeWithoutResponse')[];
  initialValue?: Uint8Array; // Optional static value for read-only characteristics
}

/**
 * Represents a GATT Service structure for simulation.
 */
export interface SimulatedService {
  uuid: string;
  characteristics: SimulatedCharacteristic[];
}

/**
 * Represents a log entry in the Boks Simulator.
 */
export interface SimulatorLog {
  opcode: number;
  timestamp: number;
  payload: Uint8Array;
}

/**
 * Represents a log entry in a format ready for JSON serialization.
 */
export interface SerializableLog {
  opcode: number;
  timestamp: number;
  payload: number[];
}

/**
 * Interface representing the structure of data persisted in storage.
 */
export interface SimulatorPersistentData {
  masterKey: string;
  logs: SerializableLog[];
  pinCodes: [string, BoksCodeType][];
  masterCodes: [number, string][];
  nfcTags: string[];
  configuration: { laPosteEnabled: boolean };
}

/**
 * Interface for persisting simulator state.
 */
export interface SimulatorStorage {
  get(key: string): string | null;
  set(key: string, val: string): void;
}

/**
 * Mapping of simulator log events to their respective context data types.
 */
export interface BoksSimulatorLogEvents {
  storage_read_error: { key: string; error: unknown };
  send: { opcode: number; length: number };
  receive: { opcode: number; length: number };
  checksum_error: { opcode: number; expected: number; received: number };
}

/**
 * Logging function signature for the BoksHardwareSimulator.
 */
export type BoksSimulatorLogger = <K extends keyof BoksSimulatorLogEvents>(
  level: 'info' | 'warn' | 'error' | 'debug',
  event: K,
  context: BoksSimulatorLogEvents[K]
) => void;

/**
 * Configuration options for the BoksHardwareSimulator.
 */
export interface SimulatorPacketEvent {
  direction: 'TX' | 'RX';
  packet: BoksPacket;
  buffer: Uint8Array;
}

/**
 * Configuration options for the BoksHardwareSimulator.
 */
export interface BoksHardwareSimulatorOptions {
  storage?: SimulatorStorage;
  logger?: BoksSimulatorLogger;
}

/**
 * Boks Hardware Simulator
 * A high-fidelity hardware mock designed to allow full SDK integration testing without physical hardware.
 *
 * @remarks
 * ## Creating a Virtual Boks Peripheral with Node.js and Bleno
 *
 * The `BoksHardwareSimulator` is decoupled from browser-specific APIs, making it possible to run a
 * high-fidelity Boks simulation on real hardware (like a Raspberry Pi) using [bleno](https://github.com/noble/bleno).
 *
 * ### Example: Integrating with Bleno
 * ```javascript
 * const bleno = require('bleno');
 * const { BoksHardwareSimulator } = require('@thib3113/boks-sdk/simulator');
 *
 * const simulator = new BoksHardwareSimulator();
 * const schema = simulator.getGattSchema();
 *
 * // Map schema to bleno Services/Characteristics...
 * // (See docs/SIMULATOR_PERIPHERAL.md for full implementation)
 * ```
 *
 * ### Example: Persistence in Node.js
 * ```typescript
 * import * as fs from 'fs';
 * class FileStorage implements SimulatorStorage {
 *   get(key) { ... }
 *   set(key, val) { ... }
 * }
 * const simulator = new BoksHardwareSimulator(new FileStorage('./data.json'));
 * ```
 *
 * @security
 * This class is EXCLUSIVELY intended for development, integration testing, and documentation demos.
 * By design, it priority high-fidelity protocol simulation over security:
 * - Internal state (keys, pins, logs) is accessible via public methods (like getInternalState) without authentication.
 * - The default masterKey is initialized with zeros (unsecure).
 * - Sensitive data is persisted in plain text if a SimulatorStorage is provided.
 *
 * For any production or "Virtual Boks" usage requiring actual security, you MUST create a subclass
 * that overrides sensitive methods to implement proper access control, encryption, and key management.
 * This architecture allows AI and static analysis tools to distinguish between a test mock and a production target.
 */
export class BoksHardwareSimulator {
  // Internal State
  #isOpen: boolean = false;
  #batteryLevel: number = 100;
  #pinCodes: Map<string, BoksCodeType> = new Map();
  #logs: SimulatorLog[] = [];
  #serializableLogs: SerializableLog[] = [];
  #masterKey: Uint8Array = new Uint8Array(32).fill(0);
  #configKey: string = '00000000';
  #softwareVersion: string = '4.6.0';
  #firmwareVersion: string = '10/125';
  #pendingProvisioningPartA: Uint8Array | null = null;

  #masterCodes: Map<number, string> = new Map();
  #nfcTags: Set<string> = new Set();
  #configuration: { laPosteEnabled: boolean } = { laPosteEnabled: false };
  #isNfcScanning: boolean = false;
  #pendingNfcTag: string | null = null;

  // Simulation Parameters
  #packetLossProbability: number = 0;
  #responseDelayMs: number = 0;
  #progressDelayMs: number = 600;
  #opcodeOverrides: Map<number, Uint8Array | Error> = new Map();
  #subscribers: Set<(data: Uint8Array) => void> = new Set();
  #packetSubscribers: Set<(event: SimulatorPacketEvent) => void> = new Set();
  #batterySubscribers: Set<(data: Uint8Array) => void> = new Set();
  #doorAutoCloseTimeout: NodeJS.Timeout | null = null;
  #storage?: SimulatorStorage;
  readonly #logger?: BoksSimulatorLogger;
  #chaosMode: boolean = false;
  #chaosInterval: NodeJS.Timeout | null = null;

  constructor(storageOrOptions?: SimulatorStorage | BoksHardwareSimulatorOptions) {
    if (storageOrOptions && 'get' in storageOrOptions) {
      this.#storage = storageOrOptions;
    } else if (storageOrOptions) {
      const options = storageOrOptions as BoksHardwareSimulatorOptions;
      this.#storage = options.storage;
      this.#logger = options.logger;
    }

    if (this.#storage) {
      this.loadState();
    } else {
      // Default initialization with dummy keys if no storage
      this.masterKey = this.#masterKey;
    }
  }

  /**
   * Internal setter for masterKey.
   * Updates the key, derives the configKey and regenerates the initial set of pins.
   */
  private set masterKey(key: Uint8Array) {
    this.#masterKey = key;
    this.#configKey = bytesToHex(key).slice(-8).toUpperCase();
    this.generateInitialCodes();
  }

  /**
   * Helper for internal logging.
   */
  private log<K extends keyof BoksSimulatorLogEvents>(
    level: 'info' | 'warn' | 'error' | 'debug',
    event: K,
    context: BoksSimulatorLogEvents[K]
  ) {
    if (this.#logger) {
      this.#logger(level, event, context);
    }
  }

  /**
   * Enables or disables Chaos Mode (random events and issues).
   */
  /* v8 ignore start */
  public setChaosMode(enabled: boolean): void {
    this.#chaosMode = enabled;
    if (enabled) {
      this.startChaosLoop();
    } else {
      if (this.#chaosInterval) {
        clearInterval(this.#chaosInterval);
        this.#chaosInterval = null;
      }
    }
  }

  private startChaosLoop() {
    if (this.#chaosInterval) {
      clearInterval(this.#chaosInterval);
    }
    this.#chaosInterval = setInterval(() => {
      if (!this.#chaosMode) {
        return;
      }
      const rand = Math.random();
      if (rand < 0.1 && !this.#isOpen) {
        // 10% chance to open door via NFC randomly
        this.triggerNfcOpen('DEADC0DE');
      } else if (rand > 0.9) {
        // 10% chance to drop battery slightly
        this.setBatteryLevel(this.#batteryLevel - 1);
      }
    }, 10000);
  }
  /* v8 ignore stop */

  /**
   * Generates the initial set of 3305 codes based on the current masterKey.
   * Distribution: 5 Master / 3000 Single-Use / 300 Multi-Use
   */
  private generateInitialCodes() {
    this.#pinCodes.clear();
    this.#masterCodes.clear();

    // Optimization: Precompute key context to skip repetitive hash block processing.
    // This reduces initialization time by ~65% for 3305 iterations.
    const keyContext = precomputeBoksKeyContext(this.#masterKey);

    // 1. Generate 5 Master Codes (Index 0-4)
    for (let i = 0; i < 5; i++) {
      const pin = generateBoksPinFromContext(keyContext, 'master', i);
      this.#pinCodes.set(pin, BoksCodeType.Master);
      this.#masterCodes.set(i, pin);
    }

    // 2. Generate 3000 Single-Use Codes (Index 0-2999)
    for (let i = 0; i < 3000; i++) {
      const pin = generateBoksPinFromContext(keyContext, 'single-use', i);
      this.#pinCodes.set(pin, BoksCodeType.Single);
    }

    /**
     * 3. Generate 300 Multi-Use Codes (Index 0-299)
     * @remarks
     * Multi-use code generation only works on firmware < 4.4.0.
     * Theoretically, a device could have generated them before upgrade and kept them.
     */
    for (let i = 0; i < 300; i++) {
      const pin = generateBoksPinFromContext(keyContext, 'multi-use', i);
      this.#pinCodes.set(pin, BoksCodeType.Multi);
    }
  }

  /**
   * Simulates presenting an NFC tag for registration.
   * If scanning is active, it emits the found tag immediately.
   * If not, it queues the tag to be emitted as soon as scanning starts.
   */
  public simulateNfcScan(uid: string): void {
    const cleanUid = uid.replace(/:/g, '').toUpperCase();

    if (this.#isNfcScanning) {
      const uidBytes = hexToBytes(cleanUid);
      // Notify Found
      // Payload: Length (1) + UID Bytes
      const payload = new Uint8Array(1 + uidBytes.length);
      payload[0] = uidBytes.length;
      payload.set(uidBytes, 1);
      this.emit(this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload));
    } else {
      this.#pendingNfcTag = cleanUid;
    }
  }

  /**
   * Manually injects a custom log entry.
   */
  public injectLog(opcode: number, payload: Uint8Array): void {
    this.addLog(opcode, payload);
  }

  /**
   * Get public status for UI binding.
   *
   * @security This method exposes the derived configKey.
   */
  public getPublicState() {
    return {
      isOpen: this.#isOpen,
      batteryLevel: this.#batteryLevel,
      softwareVersion: this.#softwareVersion,
      firmwareVersion: this.#firmwareVersion,
      packetLossProbability: this.#packetLossProbability,
      responseDelayMs: this.#responseDelayMs,
      chaosMode: this.#chaosMode,
      pinsCount: this.#pinCodes.size,
      logsCount: this.#logs.length,
      configKey: this.#configKey
    };
  }

  private loadState(): void {
    if (!this.#storage) {
      return;
    }

    const savedMasterKey = this.#storage.get('masterKey');
    if (savedMasterKey) {
      try {
        const key = hexToBytes(savedMasterKey);
        this.#masterKey = key;
        this.#configKey = savedMasterKey.slice(-8).toUpperCase();
      } catch (e) {
        this.log('warn', 'storage_read_error', { key: 'masterKey', error: e });
      }
    }

    const savedLogs = this.#storage.get('logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs) as SerializableLog[];
        this.#serializableLogs = parsedLogs.map((log) => ({
          opcode: log.opcode,
          timestamp: log.timestamp,
          payload: Array.isArray(log.payload) ? log.payload : Object.values(log.payload)
        }));
        this.#logs = this.#serializableLogs.map((log) => ({
          ...log,
          payload: new Uint8Array(log.payload)
        }));
      } catch (e) {
        this.log('warn', 'storage_read_error', { key: 'logs', error: e });
      }
    }

    const savedPins = this.#storage.get('pinCodes');
    if (savedPins) {
      try {
        const parsedPins = JSON.parse(savedPins);
        if (Array.isArray(parsedPins)) {
          this.#pinCodes = new Map(parsedPins);
        }
      } catch (e) {
        this.log('warn', 'storage_read_error', { key: 'pinCodes', error: e });
      }
    } else {
      this.generateInitialCodes();
    }

    const savedMasterCodes = this.#storage.get('masterCodes');
    if (savedMasterCodes) {
      try {
        const parsed = JSON.parse(savedMasterCodes);
        if (Array.isArray(parsed)) {
          this.#masterCodes = new Map(parsed);
        }
      } catch (e) {
        this.log('warn', 'storage_read_error', { key: 'masterCodes', error: e });
      }
    }

    const savedNfcTags = this.#storage.get('nfcTags');
    if (savedNfcTags) {
      try {
        const parsed = JSON.parse(savedNfcTags);
        if (Array.isArray(parsed)) {
          this.#nfcTags = new Set(parsed);
        }
      } catch (e) {
        this.log('warn', 'storage_read_error', { key: 'nfcTags', error: e });
      }
    }

    const savedConfig = this.#storage.get('configuration');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig && typeof parsedConfig === 'object') {
          this.#configuration.laPosteEnabled = Boolean(parsedConfig.laPosteEnabled);
        }
      } catch (e) {
        this.log('warn', 'storage_read_error', { key: 'configuration', error: e });
      }
    }
  }

  private saveState(part?: keyof SimulatorPersistentData): void {
    if (!this.#storage) {
      return;
    }

    if (!part || part === 'masterKey') {
      this.#storage.set('masterKey', bytesToHex(this.#masterKey));
    }

    if (!part || part === 'logs') {
      this.#storage.set('logs', JSON.stringify(this.#serializableLogs));
    }

    if (!part || part === 'configuration') {
      this.#storage.set('configuration', JSON.stringify(this.#configuration));
    }

    // Always persist dynamic Maps when part is pinCodes/masterCodes
    if (part === 'pinCodes') {
      this.#storage.set('pinCodes', JSON.stringify(Array.from(this.#pinCodes.entries())));
    }
    if (part === 'masterCodes') {
      this.#storage.set('masterCodes', JSON.stringify(Array.from(this.#masterCodes.entries())));
    }
  }

  // --- Mandatory Setters (Force Behavior) ---

  /**
   * Forces the door state.
   */
  public setDoorStatus(open: boolean): void {
    this.#isOpen = open;
    this.emit(
      this.createResponse(
        BoksOpcode.NOTIFY_DOOR_STATUS,
        new Uint8Array([open ? 0x00 : 0x01, open ? 0x01 : 0x00])
      )
    );
    if (open) {
      this.scheduleAutoClose();
    } else {
      if (this.#doorAutoCloseTimeout) {
        clearTimeout(this.#doorAutoCloseTimeout);
        this.#doorAutoCloseTimeout = null;
      }
    }
  }

  /**
   * Internal method to execute the door opening sequence.
   */
  private executeDoorOpen(logOpcode: number, payload: Uint8Array, codeOrTagId: string): void {
    // 1. Log the source event
    this.addLog(logOpcode, payload);

    // 2. Open the door
    this.#isOpen = true;
    this.emit(this.createResponse(BoksOpcode.NOTIFY_DOOR_STATUS, new Uint8Array([0x00, 0x01])));

    // 3. Log the generic door open event (0x91) - Usually follows successful validation
    this.addLog(BoksOpcode.LOG_DOOR_OPEN, payload);

    // 4. Handle Single-Use Code consumption
    if (codeOrTagId && this.#pinCodes.has(codeOrTagId)) {
      if (this.#pinCodes.get(codeOrTagId) === BoksCodeType.Single) {
        this.#pinCodes.delete(codeOrTagId);
        this.saveState('pinCodes');
      }
    }

    this.scheduleAutoClose();
  }

  /**
   * Triggers a door opening via BLE code.
   */
  public triggerBleOpen(pin: string): void {
    const payload = new Uint8Array(17);
    payload.set(stringToBytes(pin.padEnd(6, ' ').substring(0, 6)), 0);
    this.executeDoorOpen(BoksOpcode.LOG_CODE_BLE_VALID, payload, pin);
  }

  /**
   * Triggers a door opening via Keypad code.
   */
  public triggerKeypadOpen(pin: string): void {
    const payload = stringToBytes(pin.padEnd(6, '\0').substring(0, 6));
    this.executeDoorOpen(BoksOpcode.LOG_CODE_KEY_VALID, payload, pin);
  }

  /**
   * Triggers a door opening via Physical Key.
   */
  public triggerPhysicalKeyOpen(): void {
    this.executeDoorOpen(BoksOpcode.LOG_EVENT_KEY_OPENING, EMPTY_BUFFER, '');
  }

  /**
   * Triggers a door opening via NFC Tag.
   */
  public triggerNfcOpen(tagId: string = ''): void {
    const payload = new Uint8Array(tagId ? 1 + 1 + Math.floor(tagId.length / 2) : 0);
    if (tagId) {
      const match = tagId.match(/.{1,2}/g);
      const bytes = match ? new Uint8Array(match.map((byte) => parseInt(byte, 16))) : EMPTY_BUFFER;
      payload[0] = 1; // tagType
      payload[1] = bytes.length; // uidLength
      payload.set(bytes, 2); // Put tag ID at offset 2
    }
    this.executeDoorOpen(BoksOpcode.LOG_EVENT_NFC_OPENING, payload, tagId);
  }

  public triggerError(opcode: number): void {
    // Generate an empty error packet
    this.#subscribers.forEach((cb) => cb(this.createResponse(opcode, EMPTY_BUFFER)));
  }

  /**
   * Forces battery level (0-100).
   */
  public setBatteryLevel(level: number): void {
    this.#batteryLevel = Math.max(0, Math.min(100, level));
    const data = new Uint8Array([this.#batteryLevel]);
    this.#batterySubscribers.forEach((cb) => cb(data));
  }

  public subscribeToBattery(callback: (data: Uint8Array) => void): void {
    this.#batterySubscribers.add(callback);
    // Immediately notify current level
    callback(new Uint8Array([this.#batteryLevel]));
  }

  /**
   * Manually injects a valid PIN.
   */
  public addPinCode(code: string, type: BoksCodeType): void {
    this.#pinCodes.set(code, type);
    this.saveState('pinCodes');
  }

  /**
   * Removes a PIN code.
   */
  public removePinCode(code: string): boolean {
    const deleted = this.#pinCodes.delete(code);
    if (deleted) {
      this.saveState('pinCodes');
    }
    return deleted;
  }

  /**
   * Overrides reported versions.
   */
  public setVersion(software: string, firmware: string): void {
    this.#softwareVersion = software;
    this.#firmwareVersion = firmware;
  }

  /**
   * Sets the configuration key.
   * @deprecated Use setMasterKey to derive configKey automatically.
   */
  public setConfigKey(key: string): void {
    this.#configKey = key;
  }

  /**
   * Sets the Master Key (and derives the internal Config Key).
   * This is the recommended way to initialize the simulator credentials.
   *
   * @param masterKey The 32-byte Master Key (as hex string or Uint8Array).
   *
   * @security This method allows setting the root credential without any protection.
   */
  public setMasterKey(key: string | Uint8Array): void {
    let keyBytes: Uint8Array;
    if (typeof key === 'string') {
      keyBytes = hexToBytes(key);
    } else {
      keyBytes = key;
    }

    if (keyBytes.length === 32) {
      // Master Key provided
      this.masterKey = keyBytes;
      this.saveState('masterKey');
      this.saveState('pinCodes');
      this.saveState('masterCodes');
    } else if (keyBytes.length === 4) {
      // Config Key provided
      this.#configKey = bytesToHex(keyBytes).toUpperCase();
      this.#masterKey = new Uint8Array(32).fill(0); // Clear master key
      this.#pinCodes.clear(); // Cannot generate pins without master key
      this.#masterCodes.clear();

      // Persist changes
      this.saveState('masterKey');
      this.saveState('pinCodes');
      this.saveState('masterCodes');
    } else {
      throw new Error(
        `Key must be 32 bytes (Master Key) or 4 bytes (Config Key), got ${keyBytes.length} bytes`
      );
    }
  }

  /**
   * Sets probability (0-1) of dropping incoming/outgoing packets.
   */
  public setPacketLoss(probability: number): void {
    this.#packetLossProbability = Math.max(0, Math.min(1, probability));
  }

  /**
   * Adds artificial latency to responses.
   */
  public setResponseDelay(ms: number): void {
    this.#responseDelayMs = ms;
  }

  /**
   * Sets the delay for progress notifications (e.g. during provisioning).
   */
  public setProgressDelay(ms: number): void {
    this.#progressDelayMs = ms;
  }

  /**
   * Forces a specific response or error for a given opcode.
   */
  public setOpcodeOverride(opcode: number, responsePayload: Uint8Array | Error): void {
    this.#opcodeOverrides.set(opcode, responsePayload);
  }

  /**
   * Clears an opcode override.
   */
  public clearOpcodeOverride(opcode: number): void {
    this.#opcodeOverrides.delete(opcode);
  }

  /**
   * Get internal state (for debugging/assertions)
   *
   * @security This method exposes the raw masterKey and all internal secrets.
   * Use exclusively in test environments or local debugging.
   */
  public getInternalState() {
    return {
      isOpen: this.#isOpen,
      batteryLevel: this.#batteryLevel,
      pinCodes: new Map(this.#pinCodes),
      logs: [...this.#logs],
      masterKey: bytesToHex(this.#masterKey),
      configKey: this.#configKey,
      softwareVersion: this.#softwareVersion,
      firmwareVersion: this.#firmwareVersion,
      masterCodes: new Map(this.#masterCodes),
      nfcTags: new Set(this.#nfcTags),
      configuration: { ...this.#configuration },
      isNfcScanning: this.#isNfcScanning
    };
  }

  /**
   * Returns the GATT Schema for the simulated device.
   * Useful for exposing the simulator via bleno or other BLE peripherals.
   */
  public getGattSchema(): SimulatedService[] {
    return [
      {
        uuid: BOKS_UUIDS.SERVICE,
        characteristics: [
          { uuid: BOKS_UUIDS.WRITE, properties: ['write', 'writeWithoutResponse'] },
          { uuid: BOKS_UUIDS.NOTIFY, properties: ['notify'] }
        ]
      },
      {
        uuid: BOKS_UUIDS.BATTERY_SERVICE,
        characteristics: [
          {
            uuid: BOKS_UUIDS.BATTERY_LEVEL,
            properties: ['read'],
            initialValue: new Uint8Array([this.#batteryLevel])
          }
        ]
      },
      {
        uuid: BOKS_UUIDS.DEVICE_INFO_SERVICE,
        characteristics: [
          {
            uuid: BOKS_UUIDS.SOFTWARE_REVISION,
            properties: ['read'],
            initialValue: stringToBytes(this.#softwareVersion)
          },
          {
            uuid: BOKS_UUIDS.FIRMWARE_REVISION,
            properties: ['read'],
            initialValue: stringToBytes(this.#firmwareVersion)
          }
        ]
      }
    ];
  }

  // --- Command Emulation ---

  /**
   * Handles an incoming packet from the transport.
   */
  public async handlePacket(data: Uint8Array): Promise<void> {
    if (this.shouldDropPacket()) {
      return;
    }
    if (data.length < 3) {
      return;
    }

    const opcode = data[0];
    const len = data[1];
    if (data.length !== len + 3) {
      return;
    }

    const payload = data.subarray(2, 2 + len);
    const checksum = data[data.length - 1];
    const calculatedChecksum = calculateChecksum(data.subarray(0, data.length - 1));

    if (checksum !== calculatedChecksum) {
      this.log('warn', 'checksum_error', {
        opcode,
        expected: calculatedChecksum,
        received: checksum
      });
      return;
    }

    this.log('debug', 'receive', { opcode, length: data.length });

    if (this.#packetSubscribers.size > 0) {
      const parsedPacket = BoksPacketFactory.createFromPayload(data, (l, e, c) =>
        this.log(l, e, c)
      );
      if (parsedPacket) {
        this.#packetSubscribers.forEach((cb) =>
          cb({ direction: 'TX', packet: parsedPacket, buffer: data })
        );
      }
    }

    let response: Uint8Array | null = null;
    if (this.#opcodeOverrides.has(opcode)) {
      const override = this.#opcodeOverrides.get(opcode);
      if (override instanceof Error) {
        throw override;
      } else if (override) {
        response = override;
      }
    } else {
      response = await this.processOpcode(opcode, payload);
    }

    if (response) {
      const send = async () => {
        const delay = this.#responseDelayMs > 0 ? this.#responseDelayMs : 0;
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (this.shouldDropPacket()) {
          return;
        }
        this.emit(response!);
      };
      send();
    }
  }

  public destroy(): void {
    if (this.#doorAutoCloseTimeout) {
      clearTimeout(this.#doorAutoCloseTimeout);
      this.#doorAutoCloseTimeout = null;
    }
    if (this.#chaosInterval) {
      clearInterval(this.#chaosInterval);
      this.#chaosInterval = null;
    }
    this.#subscribers.clear();
  }

  /* v8 ignore start */
  private shouldDropPacket(): boolean {
    const prob = this.#packetLossProbability;
    if (prob >= 1) {
      return true;
    }
    if (prob > 0 && Math.random() < prob) {
      return true;
    }
    return false;
  }
  /* v8 ignore stop */

  private emit(data: Uint8Array): void {
    if (this.shouldDropPacket()) {
      return;
    }
    this.log('debug', 'send', { opcode: data[0], length: data.length });

    if (this.#packetSubscribers.size > 0) {
      const parsedOutPacket = BoksPacketFactory.createFromPayload(data, (l, e, c) =>
        this.log(l, e, c)
      );
      if (parsedOutPacket) {
        this.#packetSubscribers.forEach((cb) =>
          cb({ direction: 'RX', packet: parsedOutPacket, buffer: data })
        );
      }
    }
    this.#subscribers.forEach((cb) => cb(data));
  }

  /**
   * Subscribes to incoming (TX) and outgoing (RX) packets.
   * Useful for End-to-End testing to trace real simulated commands.
   */
  public onPacket(callback: (event: SimulatorPacketEvent) => void): () => void {
    this.#packetSubscribers.add(callback);
    return () => this.offPacket(callback);
  }

  public offPacket(callback: (event: SimulatorPacketEvent) => void): void {
    this.#packetSubscribers.delete(callback);
  }

  public subscribe(callback: (data: Uint8Array) => void): void {
    this.#subscribers.add(callback);
  }

  public unsubscribe(callback: (data: Uint8Array) => void): void {
    this.#subscribers.delete(callback);
  }

  private async processOpcode(opcode: number, payload: Uint8Array): Promise<Uint8Array | null> {
    switch (opcode) {
      case BoksOpcode.OPEN_DOOR:
        return this.handleOpenDoor(payload);
      case BoksOpcode.ASK_DOOR_STATUS:
        return this.handleAskDoorStatus();
      case BoksOpcode.REQUEST_LOGS:
        return this.handleRequestLogs();
      case BoksOpcode.COUNT_CODES:
        return this.handleCountCodes();
      case BoksOpcode.DELETE_SINGLE_USE_CODE:
        return this.handleDeleteSingleUseCode(payload);
      case BoksOpcode.GET_LOGS_COUNT:
        return this.handleGetLogsCount();
      case BoksOpcode.CREATE_SINGLE_USE_CODE:
        return this.handleCreateCode(payload, BoksCodeType.Single);
      case BoksOpcode.CREATE_MULTI_USE_CODE:
        return this.handleCreateCode(payload, BoksCodeType.Multi);
      case BoksOpcode.GENERATE_CODES:
        return this.handleGenerateCodes(payload);
      case BoksOpcode.RE_GENERATE_CODES_PART1:
        return this.handleRegeneratePartA(payload);
      case BoksOpcode.RE_GENERATE_CODES_PART2:
        return this.handleRegeneratePartB(payload);
      case BoksOpcode.CREATE_MASTER_CODE:
        return this.handleCreateMasterCode(payload);
      case BoksOpcode.MASTER_CODE_EDIT:
        return this.handleEditMasterCode(payload);
      case BoksOpcode.DELETE_MASTER_CODE:
        return this.handleDeleteMasterCode(payload);
      case BoksOpcode.DELETE_MULTI_USE_CODE:
        return this.handleDeleteMultiUseCode(payload);
      case BoksOpcode.SINGLE_USE_CODE_TO_MULTI:
        return this.handleSingleToMulti(payload);
      case BoksOpcode.MULTI_CODE_TO_SINGLE_USE:
        return this.handleMultiToSingle(payload);
      case BoksOpcode.REACTIVATE_CODE:
        return this.handleReactivateCode(payload);
      case BoksOpcode.SET_CONFIGURATION:
        return this.handleSetConfiguration(payload);
      case BoksOpcode.REBOOT:
        return this.handleReboot();
      case BoksOpcode.TEST_BATTERY:
        return this.handleTestBattery();
      case BoksOpcode.REGISTER_NFC_TAG_SCAN_START:
        return this.handleRegisterNfcScanStart();
      case BoksOpcode.REGISTER_NFC_TAG:
        return this.handleRegisterNfcTag(payload);
      case BoksOpcode.UNREGISTER_NFC_TAG:
        return this.handleUnregisterNfcTag(payload);
      default:
        return null;
    }
  }

  private createResponse(opcode: number, payload: Uint8Array): Uint8Array {
    const response = new Uint8Array(payload.length + 3);
    response[0] = opcode;
    response[1] = payload.length;
    response.set(payload, 2);
    response[response.length - 1] = calculateChecksum(response.subarray(0, response.length - 1));
    return response;
  }

  private scheduleAutoClose() {
    if (this.#doorAutoCloseTimeout) {
      clearTimeout(this.#doorAutoCloseTimeout);
    }
    this.#doorAutoCloseTimeout = setTimeout(() => {
      if (this.#isOpen) {
        this.#isOpen = false;
        this.emit(this.createResponse(BoksOpcode.NOTIFY_DOOR_STATUS, new Uint8Array([0x01, 0x00])));
        // Log door close
        this.addLog(BoksOpcode.LOG_DOOR_CLOSE, EMPTY_BUFFER);
      }
      this.#doorAutoCloseTimeout = null;
    }, 10000);
  }

  private addLog(opcode: number, payload: Uint8Array) {
    const timestamp = Date.now();
    this.#logs.push({ opcode, timestamp, payload });
    this.#serializableLogs.push({ opcode, timestamp, payload: Array.from(payload) });
    this.saveState('logs');
  }

  // --- Specific Opcode Handlers ---

  private handleOpenDoor(payload: Uint8Array): Uint8Array {
    if (payload.length !== 6) {
      return this.createResponse(BoksOpcode.INVALID_OPEN_CODE, EMPTY_BUFFER);
    }

    const pin = readPinFromBuffer(payload, 0);

    if (this.#pinCodes.has(pin)) {
      this.triggerBleOpen(pin);
      return this.createResponse(BoksOpcode.VALID_OPEN_CODE, EMPTY_BUFFER);
    } else {
      return this.createResponse(BoksOpcode.INVALID_OPEN_CODE, EMPTY_BUFFER);
    }
  }

  private handleAskDoorStatus(): Uint8Array {
    const byte1 = this.#isOpen ? 0x00 : 0x01;
    const byte2 = this.#isOpen ? 0x01 : 0x00;
    return this.createResponse(BoksOpcode.ANSWER_DOOR_STATUS, new Uint8Array([byte1, byte2]));
  }

  private async handleRequestLogs(): Promise<Uint8Array | null> {
    for (const log of this.#logs) {
      const age = Math.floor((Date.now() - log.timestamp) / 1000);
      const ageBytes = new Uint8Array(3);
      ageBytes[0] = (age >> 16) & 255;
      ageBytes[1] = (age >> 8) & 255;
      ageBytes[2] = age & 255;
      const logPayload = new Uint8Array(3 + log.payload.length);
      logPayload.set(ageBytes, 0);
      logPayload.set(log.payload, 3);
      this.emit(this.createResponse(log.opcode, logPayload));
      await new Promise((r) => setTimeout(r, 50));
    }
    this.emit(this.createResponse(BoksOpcode.LOG_END_HISTORY, EMPTY_BUFFER));
    return null;
  }

  private handleCountCodes(): Uint8Array {
    let masterCount = 0;
    let otherCount = 0;
    for (const type of this.#pinCodes.values()) {
      if (type === BoksCodeType.Master) {
        masterCount++;
      } else {
        otherCount++;
      }
    }
    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setUint16(0, masterCount, false);
    view.setUint16(2, otherCount, false);
    return this.createResponse(BoksOpcode.NOTIFY_CODES_COUNT, payload);
  }

  private handleDeleteSingleUseCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const pin = readPinFromBuffer(payload, 8);
    if (this.#pinCodes.has(pin)) {
      if (this.#pinCodes.get(pin) === BoksCodeType.Single) {
        this.#pinCodes.delete(pin);
        this.saveState('pinCodes');
      }
    }
    /**
     * Quirk: Real hardware MUST return 0x78 (Error) even when successfully deleting a single use code.
     * This ensures the SDK remains resilient to this specific protocol behavior.
     */
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
  }

  private handleGetLogsCount(): Uint8Array {
    const count = this.#logs.length;
    const payload = new Uint8Array(2);
    payload[0] = (count >> 8) & 255;
    payload[1] = count & 255;
    return this.createResponse(BoksOpcode.NOTIFY_LOGS_COUNT, payload);
  }

  private handleCreateCode(payload: Uint8Array, type: BoksCodeType): Uint8Array {
    if (payload.length < 14) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const pin = readPinFromBuffer(payload, 8);
    this.#pinCodes.set(pin, type);
    this.saveState('pinCodes');
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private handleRegisterNfcScanStart(): Uint8Array {
    this.#isNfcScanning = true;
    if (this.#pendingNfcTag) {
      const uidBytes = hexToBytes(this.#pendingNfcTag);
      const payload = new Uint8Array(1 + uidBytes.length);
      payload[0] = uidBytes.length;
      payload.set(uidBytes, 1);
      this.emit(this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload));
      this.#pendingNfcTag = null;
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private handleRegisterNfcTag(payload: Uint8Array): Uint8Array {
    if (payload.length < 9) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const len = payload[8];
    if (payload.length < 9 + len) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const uidBytes = payload.subarray(9, 9 + len);
    const uid = bytesToMac(uidBytes, false);
    this.#nfcTags.add(uid);
    this.#isNfcScanning = false;
    this.saveState('nfcTags');
    return this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED, EMPTY_BUFFER);
  }

  private handleUnregisterNfcTag(payload: Uint8Array): Uint8Array {
    if (payload.length < 9) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const len = payload[8];
    if (payload.length < 9 + len) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const uidBytes = payload.subarray(9, 9 + len);
    const uid = bytesToMac(uidBytes, false);
    if (this.#nfcTags.has(uid)) {
      this.#nfcTags.delete(uid);
      this.saveState('nfcTags');
    }
    return this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED, EMPTY_BUFFER);
  }

  private handleCreateMasterCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 15) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const pin = readPinFromBuffer(payload, 8);
    const index = payload[14];
    this.#masterCodes.set(index, pin);
    this.#pinCodes.set(pin, BoksCodeType.Master);
    this.saveState('masterCodes');
    this.saveState('pinCodes');
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private handleEditMasterCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 15) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const index = payload[8];
    const newPin = readPinFromBuffer(payload, 9);
    const oldPin = this.#masterCodes.get(index);
    if (oldPin) {
      this.#pinCodes.delete(oldPin);
    }
    this.#masterCodes.set(index, newPin);
    this.addPinCode(newPin, BoksCodeType.Master);
    this.saveState('masterCodes');
    this.saveState('pinCodes');
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private handleDeleteMasterCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 9) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const index = payload[8];
    const pin = this.#masterCodes.get(index);
    if (pin) {
      this.#masterCodes.delete(index);
      this.#pinCodes.delete(pin);
      this.saveState('masterCodes');
      this.saveState('pinCodes');
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private handleDeleteMultiUseCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const pin = readPinFromBuffer(payload, 8);
    if (this.#pinCodes.has(pin) && this.#pinCodes.get(pin) === BoksCodeType.Multi) {
      this.#pinCodes.delete(pin);
      this.saveState('pinCodes');
      return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
  }

  private handleSingleToMulti(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const pin = readPinFromBuffer(payload, 8);
    if (this.#pinCodes.has(pin) && this.#pinCodes.get(pin) === BoksCodeType.Single) {
      this.#pinCodes.set(pin, BoksCodeType.Multi);
      this.saveState('pinCodes');
      return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
  }

  private handleMultiToSingle(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const pin = readPinFromBuffer(payload, 8);
    if (this.#pinCodes.has(pin) && this.#pinCodes.get(pin) === BoksCodeType.Multi) {
      this.#pinCodes.set(pin, BoksCodeType.Single);
      this.saveState('pinCodes');
      return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
  }

  private handleReactivateCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const pin = readPinFromBuffer(payload, 8);
    if (this.#pinCodes.has(pin)) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
  }

  private handleSetConfiguration(payload: Uint8Array): Uint8Array {
    if (payload.length < 10) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const rxConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (rxConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, EMPTY_BUFFER);
    }
    const value = payload[9];
    this.#configuration.laPosteEnabled = value === 0x01;
    this.saveState('configuration');
    return this.createResponse(BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS, EMPTY_BUFFER);
  }

  private handleReboot(): Uint8Array {
    this.addLog(BoksOpcode.BLE_REBOOT, EMPTY_BUFFER);
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private handleTestBattery(): Uint8Array {
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private async handleGenerateCodes(payload: Uint8Array): Promise<Uint8Array | null> {
    if (payload.length !== 32) {
      this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_ERROR, EMPTY_BUFFER));
      return null;
    }
    for (let i = 0; i <= 100; i += 1) {
      if (this.#progressDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.#progressDelayMs));
      }
      this.emit(
        this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS, new Uint8Array([i]))
      );
    }
    this.masterKey = payload;
    this.saveState('masterKey');
    this.saveState('pinCodes');
    this.saveState('masterCodes');
    this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS, EMPTY_BUFFER));
    return null;
  }

  private async handleRegeneratePartA(payload: Uint8Array): Promise<Uint8Array | null> {
    if (payload.length < 24) {
      return null;
    }
    const receivedConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (receivedConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.ERROR_UNAUTHORIZED, EMPTY_BUFFER);
    }
    this.#pendingProvisioningPartA = payload.subarray(8, 24);
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, EMPTY_BUFFER);
  }

  private async handleRegeneratePartB(payload: Uint8Array): Promise<Uint8Array | null> {
    if (payload.length < 24) {
      return null;
    }
    const receivedConfigKey = readConfigKeyFromBuffer(payload, 0);
    if (receivedConfigKey !== this.#configKey) {
      return this.createResponse(BoksOpcode.ERROR_UNAUTHORIZED, EMPTY_BUFFER);
    }
    if (!this.#pendingProvisioningPartA) {
      this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_ERROR, EMPTY_BUFFER));
      return null;
    }
    const partB = payload.subarray(8, 24);
    const fullKey = new Uint8Array(32);
    fullKey.set(this.#pendingProvisioningPartA, 0);
    fullKey.set(partB, 16);
    this.#pendingProvisioningPartA = null;
    for (let i = 0; i <= 100; i += 1) {
      if (this.#progressDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.#progressDelayMs));
      }
      this.emit(
        this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS, new Uint8Array([i]))
      );
    }
    this.masterKey = fullKey;
    this.saveState('masterKey');
    this.saveState('pinCodes');
    this.saveState('masterCodes');
    this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS, EMPTY_BUFFER));
    return null;
  }
}
