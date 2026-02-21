import { BoksOpcode } from './protocol/constants';
import { calculateChecksum, stringToBytes, bytesToString } from './utils/converters';
import { BoksTransport } from './client/transport';

/**
 * Represents a log entry in the Boks Simulator.
 */
export interface SimulatorLog {
  opcode: number;
  timestamp: number;
  payload: Uint8Array;
}

/**
 * Represents the type of a PIN code in the simulator.
 */
export type SimulatorPinType = 'master' | 'single' | 'multi';

/**
 * Boks Hardware Simulator
 * A high-fidelity hardware mock designed to allow full SDK integration testing without physical hardware.
 */
export class BoksHardwareSimulator {
  // Internal State
  private isOpen: boolean = false;
  private batteryLevel: number = 100;
  private pinCodes: Map<string, SimulatorPinType> = new Map();
  private logs: SimulatorLog[] = [];
  private configKey: string = '00000000';
  private softwareVersion: string = '4.6.0';
  private firmwareVersion: string = '10/125';

  // Simulation Parameters
  private packetLossProbability: number = 0;
  private responseDelayMs: number = 0;
  private opcodeOverrides: Map<number, Uint8Array | Error> = new Map();
  private subscribers: ((data: Uint8Array) => void)[] = [];
  private doorAutoCloseTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Default initial state
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
   * Forces battery level (0-100).
   */
  public setBatteryLevel(level: number): void {
    this.batteryLevel = Math.max(0, Math.min(100, level));
  }

  /**
   * Manually injects a valid PIN.
   */
  public addPinCode(code: string, type: SimulatorPinType): void {
    this.pinCodes.set(code, type);
  }

  /**
   * Removes a PIN code.
   */
  public removePinCode(code: string): boolean {
    return this.pinCodes.delete(code);
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
      // Simulate Processing Delay
      if (this.responseDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.responseDelayMs));
      }

      // Simulate Packet Loss (Outgoing)
      if (Math.random() < this.packetLossProbability) {
        return; // Drop response
      }

      this.emit(response);
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
  }

  // --- Specific Opcode Handlers ---

  private handleOpenDoor(payload: Uint8Array): Uint8Array {
    // Payload: [Pin(6 bytes)] or [ConfigKey(8 bytes) + Pin(6 bytes)]?
    // Usually OPEN_DOOR (0x01) payload is just the PIN (6 chars).
    // Let's assume standard format: 6 bytes.
    // If authenticated open, it might be different. Let's assume simple PIN open for now as per spec "If PIN exists...".

    // Wait, the standard packet might include other things.
    // If the payload is short, it's just the PIN.
    let pin: string;
    if (payload.length === 6) {
      pin = bytesToString(payload);
    } else if (payload.length >= 14) {
      // Maybe Auth? But standard OPEN_DOOR is usually just PIN.
      // Let's assume 6 bytes for simplicity unless it fails.
      // The spec doesn't specify payload format, so we assume standard protocol.
      // If it's a 6-digit PIN.
      pin = bytesToString(payload.slice(0, 6));
    } else {
      return this.createResponse(BoksOpcode.INVALID_OPEN_CODE, new Uint8Array(0));
    }

    if (this.pinCodes.has(pin)) {
      this.isOpen = true;
      this.scheduleAutoClose();
      this.addLog(BoksOpcode.LOG_DOOR_OPEN, payload);
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
      if (type === 'master') masterCount++;
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
      if (type === 'single') {
        this.pinCodes.delete(pin);
      }
    }

    // BUG: ALWAYS return ERROR even if deleted.
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));
  }
}

/**
 * Transport implementation for the Boks Hardware Simulator.
 */
export class SimulatorTransport implements BoksTransport {
  private simulator: BoksHardwareSimulator;

  constructor(simulator: BoksHardwareSimulator) {
    this.simulator = simulator;
  }

  async connect(): Promise<void> {
    // No-op for simulator
  }

  async disconnect(): Promise<void> {
    // No-op for simulator
  }

  async write(data: Uint8Array): Promise<void> {
    await this.simulator.handlePacket(data);
  }

  async read(uuid: string): Promise<Uint8Array> {
    // Handle GATT reads
    // UUIDs should probably be normalized or checked loosely.
    // BOKS_UUIDS.BATTERY_LEVEL (0x2A19)
    if (uuid.includes('2a19') || uuid.includes('2A19')) {
      const state = this.simulator.getState();
      return new Uint8Array([state.batteryLevel]);
    }
    // Software Rev (0x2A28)
    if (uuid.includes('2a28') || uuid.includes('2A28')) {
      const state = this.simulator.getState();
      return stringToBytes(state.softwareVersion);
    }
    // Firmware Rev (0x2A26)
    if (uuid.includes('2a26') || uuid.includes('2A26')) {
      const state = this.simulator.getState();
      return stringToBytes(state.firmwareVersion);
    }

    return new Uint8Array(0);
  }

  async subscribe(callback: (data: Uint8Array) => void): Promise<void> {
    this.simulator.subscribe(callback);
  }
}
