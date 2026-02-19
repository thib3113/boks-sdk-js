import { BoksClient, BoksClientOptions } from './BoksClient';
import {
  BoksOpcode,
  BOKS_UUIDS,
  RegisterNfcTagScanStartPacket,
  NotifyNfcTagFoundPacket,
  ErrorNfcScanTimeoutPacket,
  ErrorNfcTagAlreadyExistsScanPacket
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';

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
}
