import { BoksClient, BoksClientOptions } from './BoksClient';
import {
  BoksPacket,
  BoksOpcode,
  BOKS_UUIDS,
  RegisterNfcTagScanStartPacket,
  NotifyNfcTagFoundPacket,
  ErrorNfcScanTimeoutPacket,
  ErrorNfcTagAlreadyExistsScanPacket,
  NfcRegisterPacket,
  UnregisterNfcTagPacket,
  NotifyNfcTagUnregisteredPacket,
  OpenDoorPacket,
  AskDoorStatusPacket,
  AnswerDoorStatusPacket,
  NotifyDoorStatusPacket,
  GetLogsCountPacket,
  NotifyLogsCountPacket,
  TestBatteryPacket,
  RebootPacket,
  BoksHistoryEvent,
  GenerateCodesPacket,
  CreateMasterCodePacket,
  CreateSingleUseCodePacket,
  CreateMultiUseCodePacket,
  DeleteMasterCodePacket,
  DeleteSingleUseCodePacket,
  DeleteMultiUseCodePacket,
  RegeneratePartAPacket,
  RegeneratePartBPacket,
  NotifyCodeGenerationProgressPacket,
  ReactivateCodePacket,
  MasterCodeEditPacket,
  SetConfigurationPacket,
  MultiToSingleCodePacket,
  SingleToMultiCodePacket,
  BoksCodeType,
  CountCodesPacket,
  NotifyCodesCountPacket,
  BoksBatteryStats,
  // Scale
  ScaleBondPacket,
  ScaleMeasureWeightPacket,
  NotifyScaleMeasureWeightPacket,
  ScaleTareEmptyPacket,
  NotifyScaleTareEmptyOkPacket,
  ScaleTareLoadedPacket,
  NotifyScaleTareLoadedOkPacket,
  ScaleForgetPacket,
  NotifyScaleBondingForgetSuccessPacket,
  ScaleGetRawSensorsPacket,
  NotifyScaleRawSensorsPacket
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';
import { hexToBytes, bytesToHex } from '@/utils/converters';
import { validateMasterCodeIndex, validateSeed, validateCredentialsKey } from '@/utils/validation';

export interface BoksHardwareInfo {
  firmwareRevision: string; // Internal FW revision (e.g. "10/125")
  softwareRevision: string; // Application version (e.g. "4.2.0")
  hardwareVersion: string; // Deduced HW version (e.g. "4.0")
  chipset: string; // Deduced chipset (e.g. "nRF52833")
}

export interface NfcScanResult {
  tagId: string;
  register: () => Promise<boolean>;
}

interface BoksRequirements {
  minHw?: string;
  minSw?: string;
  featureName: string;
}

/**
 * High-level controller for Boks devices.
 * Manages version-specific logic, feature flags, and complex workflows.
 */
export class BoksController {
  readonly #client: BoksClient;
  private _hardwareInfo: BoksHardwareInfo | null = null;
  #masterKey: string | null = null;
  #configKey: string | null = null;

  #doorOpen: boolean = false;
  #codeCount: { master: number; other: number } = { master: 0, other: 0 };
  #logCount: number = 0;
  #lastOpenAttempt: number = 0;

  constructor(optionsOrClient?: BoksClientOptions | BoksClient) {
    if (optionsOrClient instanceof BoksClient) {
      this.#client = optionsOrClient;
    } else {
      this.#client = new BoksClient(optionsOrClient);
    }
    this.#client.onPacket(this.#handleInternalPacket.bind(this));
  }

  get doorOpen(): boolean {
    return this.#doorOpen;
  }

  get codeCount(): { master: number; other: number } {
    return { ...this.#codeCount };
  }

  get logCount(): number {
    return this.#logCount;
  }

  #handleInternalPacket(packet: BoksPacket): void {
    switch (packet.opcode) {
      case BoksOpcode.ANSWER_DOOR_STATUS:
      case BoksOpcode.NOTIFY_DOOR_STATUS:
        this.#handleDoorStatus(packet as AnswerDoorStatusPacket | NotifyDoorStatusPacket);
        break;
      case BoksOpcode.NOTIFY_CODES_COUNT:
        this.#handleCodesCount(packet as NotifyCodesCountPacket);
        break;
      case BoksOpcode.NOTIFY_LOGS_COUNT:
        this.#handleLogsCount(packet as NotifyLogsCountPacket);
        break;
    }
  }

  #handleDoorStatus(packet: AnswerDoorStatusPacket | NotifyDoorStatusPacket): void {
    this.#doorOpen = packet.isOpen;
  }

  #handleCodesCount(packet: NotifyCodesCountPacket): void {
    this.#codeCount = {
      master: packet.masterCount,
      other: packet.otherCount
    };
  }

  #handleLogsCount(packet: NotifyLogsCountPacket): void {
    this.#logCount = packet.count;
  }

  /**
   * Subscribes to all incoming packets.
   * @param callback Function called for every parsed packet received.
   * @returns A function to unsubscribe.
   */
  onPacket(callback: (packet: BoksPacket) => void): () => void {
    return this.#client.onPacket(callback);
  }

  /**
   * Sets the Master Key and derives the Config Key, or sets Config Key directly.
   * @param key The 32-byte Master Key or 4-byte Config Key (as hex string or Uint8Array).
   */
  setCredentials(key: string | Uint8Array): void {
    validateCredentialsKey(key);

    let normalizedHex: string;
    if (typeof key === 'string') {
      normalizedHex = key.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    } else {
      normalizedHex = bytesToHex(key);
    }

    if (normalizedHex.length === 64) {
      // Master Key (32 bytes = 64 hex chars)
      this.#masterKey = normalizedHex;
      // Derive Config Key: Last 8 hex chars of the master key.
      this.#configKey = normalizedHex.slice(-8);
    } else {
      // Config Key (4 bytes = 8 hex chars)
      this.#masterKey = null;
      this.#configKey = normalizedHex;
    }
  }

  /**
   * Helper to perform a standard operation: send packet -> wait for success/error.
   */
  private async performOperation(
    packet: BoksPacket,
    successOpcode: BoksOpcode = BoksOpcode.CODE_OPERATION_SUCCESS,
    errorOpcode: BoksOpcode = BoksOpcode.CODE_OPERATION_ERROR
  ): Promise<boolean> {
    await this.#client.send(packet);
    const result = await this.#client.waitForOneOf<BoksPacket>([successOpcode, errorOpcode]);
    return result.opcode === successOpcode;
  }

  /**
   * Returns the Config Key or throws if not set.
   */
  private getConfigKeyOrThrow(): string {
    if (!this.#configKey) {
      throw new BoksClientError(
        BoksClientErrorId.INVALID_PARAMETER,
        'Credentials not set. Call setCredentials() first.'
      );
    }
    return this.#configKey;
  }

  /**
   * Connects to the Boks device and retrieves version information.
   */
  async connect(): Promise<void> {
    await this.#client.connect();
    await this.refreshVersions();
  }

  /**
   * Disconnects from the Boks device.
   */
  async disconnect(): Promise<void> {
    await this.#client.disconnect();
  }

  /**
   * Retrieves the cached hardware info.
   */
  get hardwareInfo(): BoksHardwareInfo | null {
    return this._hardwareInfo;
  }

  /**
   * Retrieves the current Master Key (hex string).
   */
  get masterKey(): string | null {
    return this.#masterKey;
  }

  /**
   * Refreshes version information from the device.
   */
  private async refreshVersions(): Promise<void> {
    const textDecoder = new TextDecoder('utf-8');

    // Read Software Revision
    const swBytes = await this.#client.readCharacteristic(BOKS_UUIDS.SOFTWARE_REVISION);
    const swRevision = textDecoder.decode(swBytes).replace(/\0/g, '').trim();

    // Read Firmware Revision (Internal)
    const fwBytes = await this.#client.readCharacteristic(BOKS_UUIDS.FIRMWARE_REVISION);
    const fwRevision = textDecoder.decode(fwBytes).replace(/\0/g, '').trim();

    this._hardwareInfo = this.deriveHardwareInfo(fwRevision, swRevision);
  }

  /**
   * Derives hardware version and chipset from the internal firmware revision.
   */
  private deriveHardwareInfo(fwRevision: string, swRevision: string): BoksHardwareInfo {
    let hardwareVersion = 'Unknown';
    let chipset = 'Unknown';

    if (fwRevision.includes('10/125')) {
      hardwareVersion = '4.0';
      chipset = 'nRF52833';
    } else if (fwRevision.includes('10/cd')) {
      hardwareVersion = '3.0';
      chipset = 'nRF52811';
    }

    return {
      firmwareRevision: fwRevision,
      softwareRevision: swRevision,
      hardwareVersion,
      chipset
    };
  }

  /**
   * Compares two semantic version strings.
   * Returns:
   *  1 if v1 > v2
   * -1 if v1 < v2
   *  0 if v1 === v2
   */
  private compareSemVer(v1: string, v2: string): number {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    const len = Math.max(p1.length, p2.length);

    for (let i = 0; i < len; i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  /**
   * Verifies if the device meets the requirements for a specific feature.
   */
  private checkRequirements(requirements: BoksRequirements): void {
    if (!this._hardwareInfo) {
      throw new BoksClientError(
        BoksClientErrorId.UNKNOWN_ERROR,
        'Hardware info not available. Not connected?',
        { requirements }
      );
    }

    // Hardware Version Check (string equality for now as these are often discrete revisions)
    if (requirements.minHw && this._hardwareInfo.hardwareVersion !== requirements.minHw) {
      throw new BoksClientError(
        BoksClientErrorId.UNSUPPORTED_FEATURE,
        `${requirements.featureName} requires Hardware Version ${requirements.minHw} (detected ${this._hardwareInfo.hardwareVersion})`,
        {
          required: requirements,
          actual: this._hardwareInfo
        }
      );
    }

    // Software Version Check (SemVer comparison)
    if (requirements.minSw) {
      const comparison = this.compareSemVer(
        this._hardwareInfo.softwareRevision,
        requirements.minSw
      );
      if (comparison < 0) {
        throw new BoksClientError(
          BoksClientErrorId.UNSUPPORTED_FEATURE,
          `${requirements.featureName} requires Software Version >= ${requirements.minSw} (detected ${this._hardwareInfo.softwareRevision})`,
          {
            required: requirements,
            actual: this._hardwareInfo
          }
        );
      }
    }
  }

  /**
   * Starts an NFC tag scan sequence.
   * Requires HW >= 4.0 and SW >= 4.3.3.
   *
   * @param timeoutMs Timeout in milliseconds for the scan operation.
   * @returns A promise resolving to an NfcScanResult containing the tagId and a register method.
   * @throws BoksClientError if timeout occurs or tag already exists.
   */
  async scanNFCTags(timeoutMs: number = 10000): Promise<NfcScanResult> {
    const configKey = this.getConfigKeyOrThrow();
    this.checkRequirements({
      minHw: '4.0',
      minSw: '4.3.3',
      featureName: 'NFC Scan'
    });

    // Start scan
    // 0x17: RegisterNfcTagScanStartPacket
    await this.#client.send(new RegisterNfcTagScanStartPacket(configKey));

    // Wait for one of the possible outcomes
    const result = await this.#client.waitForOneOf<
      NotifyNfcTagFoundPacket | ErrorNfcScanTimeoutPacket | ErrorNfcTagAlreadyExistsScanPacket
    >(
      [
        BoksOpcode.NOTIFY_NFC_TAG_FOUND, // 0xC5
        BoksOpcode.ERROR_NFC_SCAN_TIMEOUT, // 0xC7
        BoksOpcode.ERROR_NFC_TAG_ALREADY_EXISTS_SCAN // 0xC6
      ],
      timeoutMs
    );

    if (result.opcode === BoksOpcode.NOTIFY_NFC_TAG_FOUND) {
      const foundPacket = result as NotifyNfcTagFoundPacket;
      return {
        tagId: foundPacket.uid,
        register: () => this.registerNfcTag(foundPacket.uid)
      };
    } else if (result.opcode === BoksOpcode.ERROR_NFC_SCAN_TIMEOUT) {
      throw new BoksClientError(BoksClientErrorId.TIMEOUT, 'NFC Scan timed out');
    } else if (result.opcode === BoksOpcode.ERROR_NFC_TAG_ALREADY_EXISTS_SCAN) {
      throw new BoksClientError(BoksClientErrorId.ALREADY_EXISTS, 'NFC Tag already exists');
    }

    throw new BoksClientError(
      BoksClientErrorId.UNKNOWN_ERROR,
      `Unexpected packet during scan: ${result.opcode}`
    );
  }

  /**
   * Registers a specific NFC tag by its UID.
   * Requires HW >= 4.0 and SW >= 4.3.3.
   * Uses the derived Config Key.
   *
   * @param tagId The UID of the NFC tag (hex string, optional colons).
   * @returns True if registered successfully, false if the tag already exists.
   */
  async registerNfcTag(tagId: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    this.checkRequirements({
      minHw: '4.0',
      minSw: '4.3.3',
      featureName: 'NFC Register'
    });

    return this.performOperation(
      new NfcRegisterPacket(configKey, tagId),
      BoksOpcode.NOTIFY_NFC_TAG_REGISTERED,
      BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS
    );
  }

  /**
   * Unregisters a specific NFC tag by its UID.
   * Requires HW >= 4.0 and SW >= 4.3.3.
   * Uses the derived Config Key.
   *
   * @param tagId The UID of the NFC tag (hex string, optional colons).
   * @returns True if unregistered successfully.
   */
  async unregisterNfcTag(tagId: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    this.checkRequirements({
      minHw: '4.0',
      minSw: '4.3.3',
      featureName: 'NFC Unregister'
    });

    await this.#client.send(new UnregisterNfcTagPacket(configKey, tagId));

    await this.#client.waitForPacket<NotifyNfcTagUnregisteredPacket>(
      BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED // 0xCA
    );

    return true;
  }

  /**
   * Opens the door using the provided PIN code.
   * @param pin The PIN code to use.
   * @returns True if the door opened successfully, false if the PIN was invalid.
   */
  async openDoor(pin: string): Promise<boolean> {
    const now = Date.now();
    if (now - this.#lastOpenAttempt < 1000) {
      throw new BoksClientError(
        BoksClientErrorId.RATE_LIMIT_REACHED,
        'Please wait 1 second between door opening attempts.'
      );
    }
    this.#lastOpenAttempt = now;

    return this.performOperation(
      new OpenDoorPacket(pin),
      BoksOpcode.VALID_OPEN_CODE,
      BoksOpcode.INVALID_OPEN_CODE
    );
  }

  /**
   * Requests the current status of the door (open or closed).
   * @returns True if the door is open, false if closed.
   */
  async getDoorStatus(): Promise<boolean> {
    await this.#client.send(new AskDoorStatusPacket());
    const packet = await this.#client.waitForOneOf<AnswerDoorStatusPacket | NotifyDoorStatusPacket>(
      [BoksOpcode.ANSWER_DOOR_STATUS, BoksOpcode.NOTIFY_DOOR_STATUS]
    );
    return packet.isOpen;
  }

  /**
   * Requests the number of logs stored in the device.
   * @returns The number of logs.
   */
  async getLogsCount(): Promise<number> {
    await this.#client.send(new GetLogsCountPacket());
    const packet = await this.#client.waitForPacket<NotifyLogsCountPacket>(
      BoksOpcode.NOTIFY_LOGS_COUNT
    );
    return packet.count;
  }

  /**
   * Requests the number of active codes.
   * @returns An object containing the count of master codes and other codes.
   */
  async countCodes(): Promise<{ masterCount: number; otherCount: number }> {
    await this.#client.send(new CountCodesPacket());
    const packet = await this.#client.waitForPacket<NotifyCodesCountPacket>(
      BoksOpcode.NOTIFY_CODES_COUNT
    );
    return {
      masterCount: packet.masterCount,
      otherCount: packet.otherCount
    };
  }

  /**
   * Triggers a battery test on the device.
   */
  async testBattery(): Promise<void> {
    await this.#client.send(new TestBatteryPacket());
  }

  /**
   * Reads the current battery level (standard Bluetooth characteristic).
   * @returns Battery level (0-100) or undefined if unreliable.
   */
  async getBatteryLevel(): Promise<number | undefined> {
    return this.#client.getBatteryLevel();
  }

  /**
   * Reads detailed battery statistics (custom Boks characteristic).
   * @returns Battery stats object or undefined if unreliable.
   */
  async getBatteryStats(): Promise<BoksBatteryStats | undefined> {
    return this.#client.getBatteryStats();
  }

  /**
   * Reboots the Boks device.
   */
  async reboot(): Promise<void> {
    await this.#client.send(new RebootPacket());
  }

  /**
   * Fetches the full history from the Boks device.
   * @param timeoutMs Timeout between two history packets.
   */
  async fetchHistory(timeoutMs?: number): Promise<BoksHistoryEvent[]> {
    return this.#client.fetchHistory(timeoutMs);
  }

  /**
   * Creates a new master code at the specified index.
   */
  async createMasterCode(index: number, pin: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    validateMasterCodeIndex(index);
    return this.performOperation(new CreateMasterCodePacket(configKey, index, pin));
  }

  /**
   * Creates a new single-use code.
   */
  async createSingleUseCode(pin: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    return this.performOperation(new CreateSingleUseCodePacket(configKey, pin));
  }

  /**
   * Creates a new multi-use code.
   */
  async createMultiUseCode(pin: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    return this.performOperation(new CreateMultiUseCodePacket(configKey, pin));
  }

  /**
   * Deletes a master code at the specified index.
   */
  async deleteMasterCode(index: number): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    validateMasterCodeIndex(index);
    return this.performOperation(new DeleteMasterCodePacket(configKey, index));
  }

  /**
   * Deletes a single-use code.
   */
  async deleteSingleUseCode(pin: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    return this.performOperation(new DeleteSingleUseCodePacket(configKey, pin));
  }

  /**
   * Deletes a multi-use code.
   */
  async deleteMultiUseCode(pin: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    return this.performOperation(new DeleteMultiUseCodePacket(configKey, pin));
  }

  /**
   * Reactivates a disabled code.
   * @param pin The PIN code to reactivate.
   */
  async reactivateCode(pin: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    return this.performOperation(new ReactivateCodePacket(configKey, pin));
  }

  /**
   * Edits a master code at the specified index.
   * @param index The index of the master code (0-9).
   * @param newPin The new PIN code.
   */
  async editMasterCode(index: number, newPin: string): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    validateMasterCodeIndex(index);
    return this.performOperation(new MasterCodeEditPacket(configKey, index, newPin));
  }

  /**
   * Sets a configuration parameter.
   * @param params The configuration parameters (type and value).
   */
  async setConfiguration(params: { type: number; value: boolean }): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    return this.performOperation(
      new SetConfigurationPacket(configKey, params.type, params.value),
      BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS,
      BoksOpcode.CODE_OPERATION_ERROR
    );
  }

  /**
   * Converts a code type (Single <-> Multi).
   * @param pin The PIN code to convert.
   * @param targetType The target type (Single or Multi).
   */
  async convertCodeType(pin: string, targetType: BoksCodeType): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();

    const packet =
      targetType === BoksCodeType.Multi
        ? new SingleToMultiCodePacket(configKey, pin)
        : new MultiToSingleCodePacket(configKey, pin);

    return this.performOperation(packet);
  }

  /**
   * Initializes a factory-fresh Boks device with a Master Key seed.
   * ⚠️ This operation is theoretical and risky. Use with caution.
   *
   * @param seed The 32-byte seed for the Master Key (hex string or Uint8Array).
   * @param onProgress Callback for progress updates (0-100%).
   * @returns True if initialization was successful.
   */
  async initialize(
    seed: string | Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    validateSeed(seed);

    const seedBytes =
      typeof seed === 'string' ? hexToBytes(seed.replace(/[^0-9A-Fa-f]/g, '')) : seed;

    // Setup listener
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let cleanup: () => void;

      const handler = (packet: import('@/protocol').BoksPacket) => {
        if (packet.opcode === BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS) {
          const progressPacket = packet as NotifyCodeGenerationProgressPacket;
          if (onProgress) {
            onProgress(progressPacket.progress);
          }
        } else if (packet.opcode === BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS) {
          if (cleanup) cleanup();
          resolve(true);
        } else if (packet.opcode === BoksOpcode.NOTIFY_CODE_GENERATION_ERROR) {
          if (cleanup) cleanup();
          resolve(false);
        }
      };

      cleanup = this.#client.onPacket(handler);

      // Send command
      this.#client.send(new GenerateCodesPacket(seedBytes)).catch((err) => {
        if (cleanup) cleanup();
        reject(err);
      });
    });
  }

  /**
   * Regenerates the master key (Provisioning).
   *
   * @param newMasterKey The new 32-byte master key (as hex string or Uint8Array).
   * @param onProgress Callback for progress updates (0-100%).
   * @returns True if regeneration was successful, false otherwise.
   */
  async regenerateMasterKey(
    newMasterKey: string | Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const configKey = this.getConfigKeyOrThrow();
    validateSeed(newMasterKey);

    const keyBytes =
      typeof newMasterKey === 'string'
        ? hexToBytes(newMasterKey.replace(/[^0-9A-Fa-f]/g, ''))
        : newMasterKey;

    const partA = keyBytes.slice(0, 16);
    const partB = keyBytes.slice(16, 32);

    // Setup listener
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let cleanup: () => void;

      const handler = (packet: import('@/protocol').BoksPacket) => {
        if (packet.opcode === BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS) {
          const progressPacket = packet as NotifyCodeGenerationProgressPacket;
          if (onProgress) {
            onProgress(progressPacket.progress);
          }
        } else if (packet.opcode === BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS) {
          if (cleanup) cleanup();
          resolve(true);
        } else if (packet.opcode === BoksOpcode.NOTIFY_CODE_GENERATION_ERROR) {
          if (cleanup) cleanup();
          resolve(false);
        }
      };

      cleanup = this.#client.onPacket(handler);

      // Send commands
      this.#client
        .send(new RegeneratePartAPacket(configKey, partA))
        .then(() => this.#client.send(new RegeneratePartBPacket(configKey, partB)))
        .catch((err) => {
          if (cleanup) cleanup();
          reject(err);
        });
    });
  }

  /**
   * Bonds with the scale.
   * @experimental
   */
  async bondScale(): Promise<boolean> {
    return this.performOperation(
      new ScaleBondPacket(),
      BoksOpcode.NOTIFY_SCALE_BONDING_SUCCESS,
      BoksOpcode.NOTIFY_SCALE_BONDING_ERROR
    );
  }

  /**
   * Gets the weight from the scale.
   * @experimental
   */
  async getScaleWeight(): Promise<number> {
    await this.#client.send(new ScaleMeasureWeightPacket());
    const result = await this.#client.waitForPacket<NotifyScaleMeasureWeightPacket>(
      BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT
    );
    return result.weight;
  }

  /**
   * Tares the scale.
   * @param empty If true, tares as empty. If false, tares as loaded.
   * @experimental
   */
  async tareScale(empty: boolean): Promise<boolean> {
    if (empty) {
      await this.#client.send(new ScaleTareEmptyPacket());
      await this.#client.waitForPacket<NotifyScaleTareEmptyOkPacket>(
        BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK
      );
    } else {
      await this.#client.send(new ScaleTareLoadedPacket());
      await this.#client.waitForPacket<NotifyScaleTareLoadedOkPacket>(
        BoksOpcode.NOTIFY_SCALE_TARE_LOADED_OK
      );
    }
    return true;
  }

  /**
   * Forgets the scale bonding.
   * @experimental
   */
  async forgetScale(): Promise<boolean> {
    await this.#client.send(new ScaleForgetPacket());
    await this.#client.waitForPacket<NotifyScaleBondingForgetSuccessPacket>(
      BoksOpcode.NOTIFY_SCALE_BONDING_FORGET_SUCCESS
    );
    return true;
  }

  /**
   * Gets raw sensor data from the scale.
   * @experimental
   */
  async getScaleRawSensors(): Promise<Uint8Array> {
    await this.#client.send(new ScaleGetRawSensorsPacket());
    const result = await this.#client.waitForPacket<NotifyScaleRawSensorsPacket>(
      BoksOpcode.NOTIFY_SCALE_RAW_SENSORS
    );
    return result.data;
  }
}
