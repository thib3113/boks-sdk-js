import { BoksClient, BoksClientOptions } from './BoksClient';
import {
  BoksOpcode,
  BOKS_UUIDS,
  RegisterNfcTagScanStartPacket,
  NotifyNfcTagFoundPacket,
  ErrorNfcScanTimeoutPacket,
  ErrorNfcTagAlreadyExistsScanPacket,
  NfcRegisterPacket,
  UnregisterNfcTagPacket,
  NotifyNfcTagRegisteredPacket,
  NotifyNfcTagRegisteredErrorAlreadyExistsPacket,
  NotifyNfcTagUnregisteredPacket,
  OpenDoorPacket,
  ValidOpenCodePacket,
  InvalidOpenCodePacket,
  AskDoorStatusPacket,
  AnswerDoorStatusPacket,
  NotifyDoorStatusPacket,
  GetLogsCountPacket,
  NotifyLogsCountPacket,
  TestBatteryPacket,
  RebootPacket,
  BoksHistoryEvent,
  CreateMasterCodePacket,
  CreateSingleUseCodePacket,
  CreateMultiUseCodePacket,
  DeleteMasterCodePacket,
  DeleteSingleUseCodePacket,
  DeleteMultiUseCodePacket,
  OperationSuccessPacket,
  OperationErrorPacket,
  RegeneratePartAPacket,
  RegeneratePartBPacket,
  NotifyCodeGenerationProgressPacket
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';
import { hexToBytes } from '@/utils/converters';

export interface BoksHardwareInfo {
  firmwareRevision: string; // Internal FW revision (e.g. "10/125")
  softwareRevision: string; // Application version (e.g. "4.2.0")
  hardwareVersion: string; // Deduced HW version (e.g. "4.0")
  chipset: string; // Deduced chipset (e.g. "nRF52833")
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
  private readonly client: BoksClient;
  private _hardwareInfo: BoksHardwareInfo | null = null;

  constructor(optionsOrClient?: BoksClientOptions | BoksClient) {
    if (optionsOrClient instanceof BoksClient) {
      this.client = optionsOrClient;
    } else {
      this.client = new BoksClient(optionsOrClient);
    }
  }

  /**
   * Connects to the Boks device and retrieves version information.
   */
  async connect(): Promise<void> {
    await this.client.connect();
    await this.refreshVersions();
  }

  /**
   * Disconnects from the Boks device.
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Retrieves the cached hardware info.
   */
  get hardwareInfo(): BoksHardwareInfo | null {
    return this._hardwareInfo;
  }

  /**
   * Refreshes version information from the device.
   */
  private async refreshVersions(): Promise<void> {
    const textDecoder = new TextDecoder('utf-8');

    // Read Software Revision
    const swBytes = await this.client.readCharacteristic(BOKS_UUIDS.SOFTWARE_REVISION);
    const swRevision = textDecoder.decode(swBytes).replace(/\0/g, '').trim();

    // Read Firmware Revision (Internal)
    const fwBytes = await this.client.readCharacteristic(BOKS_UUIDS.FIRMWARE_REVISION);
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
   * @param configKey The 8-character hex configuration key required for authentication.
   * @param timeoutMs Timeout in milliseconds for the scan operation.
   * @returns The resulting packet: Found, Timeout, or Already Exists.
   */
  async scanNFCTags(
    configKey: string,
    timeoutMs: number = 10000
  ): Promise<
    NotifyNfcTagFoundPacket | ErrorNfcScanTimeoutPacket | ErrorNfcTagAlreadyExistsScanPacket
  > {
    this.checkRequirements({
      minHw: '4.0',
      minSw: '4.3.3',
      featureName: 'NFC Scan'
    });

    // Start scan
    // 0x17: RegisterNfcTagScanStartPacket
    await this.client.send(new RegisterNfcTagScanStartPacket(configKey));

    // Wait for one of the possible outcomes
    return this.client.waitForOneOf<
      NotifyNfcTagFoundPacket | ErrorNfcScanTimeoutPacket | ErrorNfcTagAlreadyExistsScanPacket
    >(
      [
        BoksOpcode.NOTIFY_NFC_TAG_FOUND, // 0xC5
        BoksOpcode.ERROR_NFC_SCAN_TIMEOUT, // 0xC7
        BoksOpcode.ERROR_NFC_TAG_ALREADY_EXISTS_SCAN // 0xC6
      ],
      timeoutMs
    );
  }

  /**
   * Registers a specific NFC tag by its UID.
   * Requires HW >= 4.0 and SW >= 4.3.3.
   *
   * @param configKey The 8-character hex configuration key required for authentication.
   * @param tagId The UID of the NFC tag (hex string, optional colons).
   * @returns True if registered successfully, false if the tag already exists.
   */
  async registerNfcTag(configKey: string, tagId: string): Promise<boolean> {
    this.checkRequirements({
      minHw: '4.0',
      minSw: '4.3.3',
      featureName: 'NFC Register'
    });

    await this.client.send(new NfcRegisterPacket(configKey, tagId));

    const result = await this.client.waitForOneOf<
      NotifyNfcTagRegisteredPacket | NotifyNfcTagRegisteredErrorAlreadyExistsPacket
    >([
      BoksOpcode.NOTIFY_NFC_TAG_REGISTERED, // 0xC8
      BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS // 0xC9
    ]);

    return result.opcode === BoksOpcode.NOTIFY_NFC_TAG_REGISTERED;
  }

  /**
   * Unregisters a specific NFC tag by its UID.
   * Requires HW >= 4.0 and SW >= 4.3.3.
   *
   * @param configKey The 8-character hex configuration key required for authentication.
   * @param tagId The UID of the NFC tag (hex string, optional colons).
   * @returns True if unregistered successfully.
   */
  async unregisterNfcTag(configKey: string, tagId: string): Promise<boolean> {
    this.checkRequirements({
      minHw: '4.0',
      minSw: '4.3.3',
      featureName: 'NFC Unregister'
    });

    await this.client.send(new UnregisterNfcTagPacket(configKey, tagId));

    await this.client.waitForPacket<NotifyNfcTagUnregisteredPacket>(
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
    await this.client.send(new OpenDoorPacket(pin));
    const result = await this.client.waitForOneOf<ValidOpenCodePacket | InvalidOpenCodePacket>([
      BoksOpcode.VALID_OPEN_CODE,
      BoksOpcode.INVALID_OPEN_CODE
    ]);
    return result.opcode === BoksOpcode.VALID_OPEN_CODE;
  }

  /**
   * Requests the current status of the door (open or closed).
   * @returns True if the door is open, false if closed.
   */
  async getDoorStatus(): Promise<boolean> {
    await this.client.send(new AskDoorStatusPacket());
    const packet = await this.client.waitForOneOf<AnswerDoorStatusPacket | NotifyDoorStatusPacket>([
      BoksOpcode.ANSWER_DOOR_STATUS,
      BoksOpcode.NOTIFY_DOOR_STATUS
    ]);
    return packet.isOpen;
  }

  /**
   * Requests the number of logs stored in the device.
   * @returns The number of logs.
   */
  async getLogsCount(): Promise<number> {
    await this.client.send(new GetLogsCountPacket());
    const packet = await this.client.waitForPacket<NotifyLogsCountPacket>(
      BoksOpcode.NOTIFY_LOGS_COUNT
    );
    return packet.count;
  }

  /**
   * Triggers a battery test on the device.
   */
  async testBattery(): Promise<void> {
    await this.client.send(new TestBatteryPacket());
  }

  /**
   * Reboots the Boks device.
   */
  async reboot(): Promise<void> {
    await this.client.send(new RebootPacket());
  }

  /**
   * Fetches the full history from the Boks device.
   * @param timeoutMs Timeout between two history packets.
   */
  async fetchHistory(timeoutMs?: number): Promise<BoksHistoryEvent[]> {
    return this.client.fetchHistory(timeoutMs);
  }

  /**
   * Creates a new master code at the specified index.
   */
  async createMasterCode(configKey: string, index: number, pin: string): Promise<boolean> {
    await this.client.send(new CreateMasterCodePacket(configKey, index, pin));
    const result = await this.client.waitForOneOf<OperationSuccessPacket | OperationErrorPacket>([
      BoksOpcode.CODE_OPERATION_SUCCESS,
      BoksOpcode.CODE_OPERATION_ERROR
    ]);
    return result.opcode === BoksOpcode.CODE_OPERATION_SUCCESS;
  }

  /**
   * Creates a new single-use code.
   */
  async createSingleUseCode(configKey: string, pin: string): Promise<boolean> {
    await this.client.send(new CreateSingleUseCodePacket(configKey, pin));
    const result = await this.client.waitForOneOf<OperationSuccessPacket | OperationErrorPacket>([
      BoksOpcode.CODE_OPERATION_SUCCESS,
      BoksOpcode.CODE_OPERATION_ERROR
    ]);
    return result.opcode === BoksOpcode.CODE_OPERATION_SUCCESS;
  }

  /**
   * Creates a new multi-use code.
   */
  async createMultiUseCode(configKey: string, pin: string): Promise<boolean> {
    await this.client.send(new CreateMultiUseCodePacket(configKey, pin));
    const result = await this.client.waitForOneOf<OperationSuccessPacket | OperationErrorPacket>([
      BoksOpcode.CODE_OPERATION_SUCCESS,
      BoksOpcode.CODE_OPERATION_ERROR
    ]);
    return result.opcode === BoksOpcode.CODE_OPERATION_SUCCESS;
  }

  /**
   * Deletes a master code at the specified index.
   */
  async deleteMasterCode(configKey: string, index: number): Promise<boolean> {
    await this.client.send(new DeleteMasterCodePacket(configKey, index));
    const result = await this.client.waitForOneOf<OperationSuccessPacket | OperationErrorPacket>([
      BoksOpcode.CODE_OPERATION_SUCCESS,
      BoksOpcode.CODE_OPERATION_ERROR
    ]);
    return result.opcode === BoksOpcode.CODE_OPERATION_SUCCESS;
  }

  /**
   * Deletes a single-use code.
   */
  async deleteSingleUseCode(configKey: string, pin: string): Promise<boolean> {
    await this.client.send(new DeleteSingleUseCodePacket(configKey, pin));
    const result = await this.client.waitForOneOf<OperationSuccessPacket | OperationErrorPacket>([
      BoksOpcode.CODE_OPERATION_SUCCESS,
      BoksOpcode.CODE_OPERATION_ERROR
    ]);
    return result.opcode === BoksOpcode.CODE_OPERATION_SUCCESS;
  }

  /**
   * Deletes a multi-use code.
   */
  async deleteMultiUseCode(configKey: string, pin: string): Promise<boolean> {
    await this.client.send(new DeleteMultiUseCodePacket(configKey, pin));
    const result = await this.client.waitForOneOf<OperationSuccessPacket | OperationErrorPacket>([
      BoksOpcode.CODE_OPERATION_SUCCESS,
      BoksOpcode.CODE_OPERATION_ERROR
    ]);
    return result.opcode === BoksOpcode.CODE_OPERATION_SUCCESS;
  }

  /**
   * Regenerates the master key (Provisioning).
   *
   * @param configKey The current configuration key.
   * @param newMasterKey The new 32-byte master key (as hex string or Uint8Array).
   * @param onProgress Callback for progress updates (0-100%).
   * @returns True if regeneration was successful, false otherwise.
   */
  async regenerateMasterKey(
    configKey: string,
    newMasterKey: string | Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    let keyBytes: Uint8Array;

    if (typeof newMasterKey === 'string') {
      // Clean hex string
      const hex = newMasterKey.replace(/[^0-9A-Fa-f]/g, '');
      if (hex.length !== 64) {
        throw new BoksClientError(
          BoksClientErrorId.INVALID_PARAMETER,
          `Master Key string must be 32 bytes (64 hex chars), got ${hex.length}`
        );
      }
      keyBytes = hexToBytes(hex);
    } else {
      keyBytes = newMasterKey;
    }

    if (keyBytes.length !== 32) {
      throw new BoksClientError(
        BoksClientErrorId.INVALID_PARAMETER,
        `Master Key bytes must be 32 bytes, got ${keyBytes.length}`
      );
    }

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

      cleanup = this.client.onPacket(handler);

      // Send commands
      this.client
        .send(new RegeneratePartAPacket(configKey, partA))
        .then(() => this.client.send(new RegeneratePartBPacket(configKey, partB)))
        .catch((err) => {
          if (cleanup) cleanup();
          reject(err);
        });
    });
  }
}
