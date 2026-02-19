import { BoksClient, BoksClientOptions } from './BoksClient';
import {
  BoksOpcode,
  BOKS_UUIDS,
  RegisterNfcTagScanStartPacket,
  NotifyNfcTagFoundPacket
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';

export interface BoksHardwareInfo {
  firmwareRevision: string; // Internal FW revision (e.g. "10/125")
  softwareRevision: string; // Application version (e.g. "4.2.0")
  hardwareVersion: string; // Deduced HW version (e.g. "4.0")
  chipset: string; // Deduced chipset (e.g. "nRF52833")
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
   * Starts an NFC tag scan sequence.
   * Requires HW >= 4.0.
   *
   * @param configKey The 8-character hex configuration key required for authentication.
   * @param timeoutMs Timeout in milliseconds for the scan operation.
   * @returns The scanned NFC tag packet.
   */
  async scanNFCTags(
    configKey: string,
    timeoutMs: number = 10000
  ): Promise<NotifyNfcTagFoundPacket> {
    if (!this._hardwareInfo) {
      throw new BoksClientError(
        BoksClientErrorId.UNKNOWN_ERROR,
        'Hardware info not available. Not connected?'
      );
    }

    // Check if HW version is 4.0 or greater (currently only 4.0 supported for NFC advanced features per spec)
    // The spec says: "Le chipset nRF52833 (HW 4.0) supporte nativement des fonctions NFC plus avancées."
    if (this._hardwareInfo.hardwareVersion !== '4.0') {
      throw new BoksClientError(
        BoksClientErrorId.UNSUPPORTED_FEATURE,
        `NFC Scan requires Hardware Version 4.0 (detected ${this._hardwareInfo.hardwareVersion})`
      );
    }

    // Start scan
    // 0x17: RegisterNfcTagScanStartPacket
    await this.client.send(new RegisterNfcTagScanStartPacket(configKey));

    // Wait for notification
    // 0xC5: NotifyNfcTagFoundPacket
    return this.client.waitForPacket<NotifyNfcTagFoundPacket>(
      BoksOpcode.NOTIFY_NFC_TAG_FOUND,
      timeoutMs
    );
  }
}
