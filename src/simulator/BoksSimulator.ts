import { BoksOpcode, BoksCodeType, BoksOpenSource, BOKS_UUIDS } from '../protocol/constants';
import { calculateChecksum, bytesToString, bytesToHex, stringToBytes } from '../utils/converters';

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
 * Interface for persisting simulator state.
 */
export interface SimulatorStorage {
  get(key: string): string | null;
  set(key: string, val: string): void;
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
 */
export class BoksHardwareSimulator {
  // Internal State
  private isOpen: boolean = false;
  private batteryLevel: number = 100;
  private pinCodes: Map<string, BoksCodeType> = new Map();
  private logs: SimulatorLog[] = [];
  private configKey: string = '00000000';
  private softwareVersion: string = '4.6.0';
  private firmwareVersion: string = '10/125';
  private pendingProvisioningPartA: Uint8Array | null = null;

  // Simulation Parameters
  private packetLossProbability: number = 0;
  private responseDelayMs: number = 0;
  private opcodeOverrides: Map<number, Uint8Array | Error> = new Map();
  private subscribers: ((data: Uint8Array) => void)[] = [];
  private doorAutoCloseTimeout: NodeJS.Timeout | null = null;
  private storage?: SimulatorStorage;
  private chaosMode: boolean = false;
  private chaosInterval: NodeJS.Timeout | null = null;

  constructor(storage?: SimulatorStorage) {
    this.storage = storage;
    if (this.storage) {
      this.loadState();
    }
  }

  /**
   * Enables or disables Chaos Mode (random events and issues).
   */
  public setChaosMode(enabled: boolean): void {
    this.chaosMode = enabled;
    if (enabled) {
      this.startChaosLoop();
    } else {
      if (this.chaosInterval) {
        clearInterval(this.chaosInterval);
        this.chaosInterval = null;
      }
    }
  }

  private startChaosLoop() {
    if (this.chaosInterval) clearInterval(this.chaosInterval);
    this.chaosInterval = setInterval(() => {
      if (!this.chaosMode) return;
      const rand = Math.random();
      if (rand < 0.1 && !this.isOpen) {
        // 10% chance to open door via NFC randomly
        this.triggerDoorOpen(BoksOpenSource.Nfc, 'DEADC0DE');
      } else if (rand > 0.9) {
        // 10% chance to drop battery slightly
        this.setBatteryLevel(this.batteryLevel - 1);
      }
    }, 10000);
  }

  /**
   * Manually injects a custom log entry.
   */
  public injectLog(opcode: number, payload: Uint8Array): void {
    this.addLog(opcode, payload);
  }

  /**
   * Get public status for UI binding.
   */
  public getPublicState() {
    return {
      isOpen: this.isOpen,
      batteryLevel: this.batteryLevel,
      softwareVersion: this.softwareVersion,
      firmwareVersion: this.firmwareVersion,
      packetLossProbability: this.packetLossProbability,
      responseDelayMs: this.responseDelayMs,
      chaosMode: this.chaosMode,
      pinsCount: this.pinCodes.size,
      logsCount: this.logs.length
    };
  }

  // --- Persistence ---

  private loadState(): void {
    if (!this.storage) return;

    const savedConfigKey = this.storage.get('configKey');
    if (savedConfigKey) this.configKey = savedConfigKey;

    const savedLogs = this.storage.get('logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs) as Array<{
          opcode: number;
          timestamp: number;
          payload: number[] | Record<string, number>;
        }>;
        this.logs = parsedLogs.map((log) => ({
          ...log,
          payload: new Uint8Array(Object.values(log.payload)) // Rehydrate Uint8Array
        }));
      } catch (e) {
        console.warn('Failed to load logs:', e);
      }
    }

    const savedPins = this.storage.get('pinCodes');
    if (savedPins) {
      try {
        const parsedPins = JSON.parse(savedPins);
        this.pinCodes = new Map(parsedPins);
      } catch (e) {
        console.warn('Failed to load pin codes:', e);
      }
    }
  }

  private saveState(): void {
    if (!this.storage) return;

    this.storage.set('configKey', this.configKey);

    // Serialize logs (handle Uint8Array)
    const serializableLogs = this.logs.map((log) => ({
      ...log,
      payload: Array.from(log.payload)
    }));
    this.storage.set('logs', JSON.stringify(serializableLogs));

    // Serialize Map
    this.storage.set('pinCodes', JSON.stringify(Array.from(this.pinCodes.entries())));
  }

  // --- Mandatory Setters (Force Behavior) ---

  /**
   * Forces the door state.
   */
  public setDoorStatus(open: boolean): void {
    this.isOpen = open;
    if (open) {
      this.scheduleAutoClose();
    } else {
      if (this.doorAutoCloseTimeout) {
        clearTimeout(this.doorAutoCloseTimeout);
        this.doorAutoCloseTimeout = null;
      }
    }
  }

  /**
   * Triggers a door opening event from a specific source, generating realistic history logs.
   */
  public triggerDoorOpen(source: BoksOpenSource, codeOrTagId: string = ''): void {
    let logOpcode: number;
    let payload: Uint8Array;

    const encoder = new TextEncoder();

    switch (source) {
      case BoksOpenSource.Ble:
        logOpcode = BoksOpcode.LOG_CODE_BLE_VALID; // 0x86
        payload = encoder.encode(codeOrTagId.padEnd(6, '\0').substring(0, 6)); // Usually PIN
        break;
      case BoksOpenSource.Keypad:
        logOpcode = BoksOpcode.LOG_CODE_KEY_VALID; // 0x87
        payload = encoder.encode(codeOrTagId.padEnd(6, '\0').substring(0, 6)); // Usually PIN
        break;
      case BoksOpenSource.PhysicalKey:
        logOpcode = BoksOpcode.LOG_EVENT_KEY_OPENING; // 0x99
        payload = new Uint8Array(0);
        break;
      case BoksOpenSource.Nfc:
        logOpcode = BoksOpcode.LOG_EVENT_NFC_OPENING; // 0xA1
        // Tag ID usually hex string or bytes? Let's assume passed as string or bytes.
        // For simplicity, encode as bytes if hex string, or just empty if not critical.
        // Usually NFC log payload is Tag ID (4/7 bytes).
        // If codeOrTagId is provided, use it.
        // Assuming hex string for Tag ID.
        if (codeOrTagId) {
          // Simple hex to bytes
          const match = codeOrTagId.match(/.{1,2}/g);
          if (match) {
            payload = new Uint8Array(match.map((byte) => parseInt(byte, 16)));
          } else {
            payload = new Uint8Array(0);
          }
        } else {
          payload = new Uint8Array(0);
        }
        break;
      default:
        logOpcode = BoksOpcode.LOG_DOOR_OPEN; // Fallback
        payload = new Uint8Array(0);
    }

    // 1. Log the source event
    this.addLog(logOpcode, payload);

    // 2. Open the door
    this.isOpen = true;

    // 3. Log the generic door open event (0x91) - Usually follows successful validation
    // The existing handleOpenDoor logs 0x91. Real hardware usually logs both.
    this.addLog(BoksOpcode.LOG_DOOR_OPEN, payload);

    // 4. Handle Single-Use Code consumption
    if (codeOrTagId && this.pinCodes.has(codeOrTagId)) {
      const type = this.pinCodes.get(codeOrTagId);
      if (type === BoksCodeType.Single) {
        this.pinCodes.delete(codeOrTagId);
      }
    }

    this.scheduleAutoClose();
    this.saveState();
  }

  /**
   * Forces battery level (0-100).
   */
  public setBatteryLevel(level: number): void {
    this.batteryLevel = Math.max(0, Math.min(100, level));
  }

  /**
   * Manually injects a valid PIN.
   */
  public addPinCode(code: string, type: BoksCodeType): void {
    this.pinCodes.set(code, type);
    this.saveState();
  }

  /**
   * Removes a PIN code.
   */
  public removePinCode(code: string): boolean {
    const deleted = this.pinCodes.delete(code);
    if (deleted) this.saveState();
    return deleted;
  }

  /**
   * Overrides reported versions.
   */
  public setVersion(software: string, firmware: string): void {
    this.softwareVersion = software;
    this.firmwareVersion = firmware;
  }

  /**
   * Sets the configuration key.
   */
  public setConfigKey(key: string): void {
    this.configKey = key;
    this.saveState();
  }

  /**
   * Sets the Master Key (and derives the internal Config Key).
   * This is the recommended way to initialize the simulator credentials.
   *
   * @param masterKey The 32-byte Master Key (as hex string or Uint8Array).
   */
  public setMasterKey(masterKey: string | Uint8Array): void {
    let normalizedHex: string;

    if (typeof masterKey === 'string') {
      normalizedHex = masterKey.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    } else {
      normalizedHex = bytesToHex(masterKey);
    }

    if (normalizedHex.length !== 64) {
      throw new Error(
        `Master Key must be 32 bytes (64 hex chars), got ${normalizedHex.length} hex chars`
      );
    }

    // Derive Config Key: Last 8 hex chars of the master key.
    this.configKey = normalizedHex.slice(-8);
    this.saveState();
  }

  /**
   * Sets probability (0-1) of dropping incoming/outgoing packets.
   */
  public setPacketLoss(probability: number): void {
    this.packetLossProbability = Math.max(0, Math.min(1, probability));
  }

  /**
   * Adds artificial latency to responses.
   */
  public setResponseDelay(ms: number): void {
    this.responseDelayMs = ms;
  }

  /**
   * Forces a specific response or error for a given opcode.
   */
  public setOpcodeOverride(opcode: number, responsePayload: Uint8Array | Error): void {
    this.opcodeOverrides.set(opcode, responsePayload);
  }

  /**
   * Clears an opcode override.
   */
  public clearOpcodeOverride(opcode: number): void {
    this.opcodeOverrides.delete(opcode);
  }

  /**
   * Get internal state (for debugging/assertions)
   */
  public getState() {
    return {
      isOpen: this.isOpen,
      batteryLevel: this.batteryLevel,
      pinCodes: new Map(this.pinCodes),
      logs: [...this.logs],
      configKey: this.configKey,
      softwareVersion: this.softwareVersion,
      firmwareVersion: this.firmwareVersion
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
          {
            uuid: BOKS_UUIDS.WRITE,
            properties: ['write', 'writeWithoutResponse']
          },
          {
            uuid: BOKS_UUIDS.NOTIFY,
            properties: ['notify']
          }
        ]
      },
      {
        uuid: BOKS_UUIDS.BATTERY_SERVICE,
        characteristics: [
          {
            uuid: BOKS_UUIDS.BATTERY_LEVEL,
            properties: ['read'],
            initialValue: new Uint8Array([this.batteryLevel])
          }
        ]
      },
      {
        uuid: BOKS_UUIDS.DEVICE_INFO_SERVICE,
        characteristics: [
          {
            uuid: BOKS_UUIDS.SOFTWARE_REVISION,
            properties: ['read'],
            initialValue: stringToBytes(this.softwareVersion)
          },
          {
            uuid: BOKS_UUIDS.FIRMWARE_REVISION,
            properties: ['read'],
            initialValue: stringToBytes(this.firmwareVersion)
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
    // 1. Simulate Packet Loss (Incoming)
    if (Math.random() < this.packetLossProbability) {
      return; // Drop packet
    }

    // 2. Validate Packet Structure
    if (data.length < 3) return; // Too short
    const opcode = data[0];
    const len = data[1];
    // Basic validation: length matches payload + 3 (opcode + len + checksum)
    // But payload is len bytes. So total length = 2 + len + 1 = len + 3.
    if (data.length !== len + 3) return; // Invalid length

    const payload = data.subarray(2, 2 + len);
    const checksum = data[data.length - 1];
    const calculatedChecksum = calculateChecksum(data.subarray(0, data.length - 1));

    if (checksum !== calculatedChecksum) {
      return; // Invalid checksum, ignore
    }

    // 3. Process Command
    let response: Uint8Array | null = null;

    // Check for overrides
    if (this.opcodeOverrides.has(opcode)) {
      const override = this.opcodeOverrides.get(opcode);
      if (override instanceof Error) {
        throw override; // Simulate internal error or specific behavior
      } else if (override) {
        response = override;
      }
    } else {
      // Default behavior
      response = await this.processOpcode(opcode, payload);
    }

    // 4. Send Response (if any)
    if (response) {
      const send = async () => {
        // Simulate Processing Delay
        if (this.responseDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.responseDelayMs));
        } else {
          // Even with 0 delay, we must yield to allow client.send() to resolve
          // before the response is processed by the client listeners.
          // This mimics real BLE where Write Response and Notification are distinct events.
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        // Simulate Packet Loss (Outgoing)
        if (Math.random() < this.packetLossProbability) {
          return; // Drop response
        }

        this.emit(response);
      };

      send();
    }
  }

  private emit(data: Uint8Array): void {
    this.subscribers.forEach((cb) => cb(data));
  }

  public subscribe(callback: (data: Uint8Array) => void): void {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback: (data: Uint8Array) => void): void {
    this.subscribers = this.subscribers.filter((cb) => cb !== callback);
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
      // Add more handlers as needed
      default:
        // Default: Operation Success (generic) or ignore if unknown
        // For simplicity, we might just ignore unknown opcodes or return success for implemented ones
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
    if (this.doorAutoCloseTimeout) clearTimeout(this.doorAutoCloseTimeout);
    this.doorAutoCloseTimeout = setTimeout(() => {
      if (this.isOpen) {
        this.isOpen = false;
        // Log door close
        this.addLog(BoksOpcode.LOG_DOOR_CLOSE, new Uint8Array(0));
      }
      this.doorAutoCloseTimeout = null;
    }, 10000);
  }

  private addLog(opcode: number, payload: Uint8Array) {
    this.logs.push({
      opcode,
      timestamp: Date.now(),
      payload
    });
    this.saveState();
  }

  // --- Specific Opcode Handlers ---

  private handleOpenDoor(payload: Uint8Array): Uint8Array {
    // Payload: [Pin(6 bytes)] or [ConfigKey(8 bytes) + Pin(6 bytes)]?
    // Usually OPEN_DOOR (0x01) payload is just the PIN (6 chars).

    let pin: string;
    if (payload.length === 6) {
      pin = bytesToString(payload);
    } else if (payload.length >= 14) {
      pin = bytesToString(payload.slice(0, 6));
    } else {
      return this.createResponse(BoksOpcode.INVALID_OPEN_CODE, new Uint8Array(0));
    }

    if (this.pinCodes.has(pin)) {
      // Use triggerDoorOpen to ensure consistent logging
      // Source: Ble (since this is command 0x01)
      this.triggerDoorOpen(BoksOpenSource.Ble, pin);
      return this.createResponse(BoksOpcode.VALID_OPEN_CODE, new Uint8Array(0));
    } else {
      return this.createResponse(BoksOpcode.INVALID_OPEN_CODE, new Uint8Array(0));
    }
  }

  private handleAskDoorStatus(): Uint8Array {
    // Return 0x84 (Notify Door Status) or 0x85 (Answer Door Status). Spec says "0x84 or 0x85".
    // Payload: [Status, OpenStatus]
    // OpenStatus: 0x01 if open, 0x00 if closed.
    // Status: 0x00 if open (OK), 0x01 if closed (Locked)?
    // Spec says: payload [isOpen ? 0x00 : 0x01, isOpen ? 0x01 : 0x00]
    const byte1 = this.isOpen ? 0x00 : 0x01;
    const byte2 = this.isOpen ? 0x01 : 0x00;
    return this.createResponse(BoksOpcode.ANSWER_DOOR_STATUS, new Uint8Array([byte1, byte2]));
  }

  private async handleRequestLogs(): Promise<Uint8Array | null> {
    // Iterate logs and emit them one by one.
    // This is an async process that emits multiple packets.
    // We return null here because we emit packets directly.

    for (const log of this.logs) {
      const age = Math.floor((Date.now() - log.timestamp) / 1000);
      // Log packet format: [Opcode (of log), Age (3 bytes), ...Payload]
      // The age is 3 bytes, Big Endian

      const ageBytes = new Uint8Array(3);
      ageBytes[0] = (age >> 16) & 255;
      ageBytes[1] = (age >> 8) & 255;
      ageBytes[2] = age & 255;

      const logPayload = new Uint8Array(3 + log.payload.length);
      logPayload.set(ageBytes, 0);
      logPayload.set(log.payload, 3);

      const packet = this.createResponse(log.opcode, logPayload);
      this.emit(packet);

      await new Promise((r) => setTimeout(r, 50)); // 50ms interval
    }

    // Emit END_HISTORY
    const endPacket = this.createResponse(BoksOpcode.LOG_END_HISTORY, new Uint8Array(0));
    this.emit(endPacket);

    return null;
  }

  private handleCountCodes(): Uint8Array {
    // Return 0xC3 with current counts.
    // Payload: [MasterCount(2 bytes, BE), OtherCount(2 bytes, BE)]

    let masterCount = 0;
    let otherCount = 0;
    for (const type of this.pinCodes.values()) {
      if (type === BoksCodeType.Master) masterCount++;
      else otherCount++;
    }

    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setUint16(0, masterCount, false); // Big Endian
    view.setUint16(2, otherCount, false); // Big Endian

    return this.createResponse(BoksOpcode.NOTIFY_CODES_COUNT, payload);
  }

  private handleDeleteSingleUseCode(payload: Uint8Array): Uint8Array {
    // Payload: ConfigKey (8 bytes) + PIN (6 bytes)
    if (payload.length < 14)
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    // We ignore config key check for this specific bug reproduction or maybe check it?
    // Spec says "Find and remove code... MUST return 0x78".

    const pin = bytesToString(payload.subarray(8, 14));

    if (this.pinCodes.has(pin)) {
      const type = this.pinCodes.get(pin);
      if (type === BoksCodeType.Single) {
        this.pinCodes.delete(pin);
        this.saveState();
      }
    }

    // BUG: ALWAYS return ERROR even if deleted.
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));
  }

  private handleGetLogsCount(): Uint8Array {
    const count = this.logs.length;
    const payload = new Uint8Array(2);
    payload[0] = (count >> 8) & 255;
    payload[1] = count & 255;
    return this.createResponse(BoksOpcode.NOTIFY_LOGS_COUNT, payload);
  }

  private handleCreateCode(payload: Uint8Array, type: BoksCodeType): Uint8Array {
    // Payload: ConfigKey (8 bytes) + PIN (6 bytes)
    if (payload.length < 14)
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));
    }

    const pin = bytesToString(payload.slice(8, 14));
    this.addPinCode(pin, type);
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
  }

  private async handleGenerateCodes(payload: Uint8Array): Promise<Uint8Array | null> {
    if (payload.length !== 32) {
      this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_ERROR, new Uint8Array(0)));
      return null;
    }

    // Simulate progress: ~1 minute total (reduced to ~100ms for tests if responseDelayMs is small)
    // Use this.responseDelayMs if set, otherwise default to 600 for "realism"
    const delay = this.responseDelayMs > 0 ? this.responseDelayMs : 600;
    for (let i = 0; i <= 100; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      this.emit(
        this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS, new Uint8Array([i]))
      );
    }

    // Set Config Key (last 4 bytes of seed)
    const configKeyBytes = payload.slice(28, 32);
    this.configKey = bytesToHex(configKeyBytes);

    // Reset Pins (Factory Reset behavior)
    this.pinCodes.clear();
    this.saveState();

    this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS, new Uint8Array(0)));
    return null;
  }

  private async handleRegeneratePartA(payload: Uint8Array): Promise<Uint8Array | null> {
    if (payload.length < 24) return null;

    // Verify Config Key
    const receivedConfigKey = bytesToString(payload.slice(0, 8));
    if (receivedConfigKey !== this.configKey) {
      // Maybe return unauthorized error? Or just ignore/fail silently as per some specs.
      // Let's return error to be helpful in tests.
      return this.createResponse(BoksOpcode.ERROR_UNAUTHORIZED, new Uint8Array(0));
    }

    this.pendingProvisioningPartA = payload.slice(8, 24);
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
  }

  private async handleRegeneratePartB(payload: Uint8Array): Promise<Uint8Array | null> {
    if (payload.length < 24) return null;

    // Verify Config Key
    const receivedConfigKey = bytesToString(payload.slice(0, 8));
    if (receivedConfigKey !== this.configKey) {
      return this.createResponse(BoksOpcode.ERROR_UNAUTHORIZED, new Uint8Array(0));
    }

    if (!this.pendingProvisioningPartA) {
      this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_ERROR, new Uint8Array(0)));
      return null;
    }

    const partB = payload.slice(8, 24);
    const fullKey = new Uint8Array(32);
    fullKey.set(this.pendingProvisioningPartA, 0);
    fullKey.set(partB, 16);

    this.pendingProvisioningPartA = null;

    // Simulate progress
    const delay = this.responseDelayMs > 0 ? this.responseDelayMs : 600;
    for (let i = 0; i <= 100; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      this.emit(
        this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS, new Uint8Array([i]))
      );
    }

    // Update Config Key
    const configKeyBytes = fullKey.slice(28, 32);
    this.configKey = bytesToHex(configKeyBytes);
    this.saveState();

    this.emit(this.createResponse(BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS, new Uint8Array(0)));
    return null;
  }
}
