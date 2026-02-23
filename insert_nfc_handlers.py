import os

file_path = 'src/simulator/BoksSimulator.ts'
insert_marker_handlers = 'private async handleGenerateCodes'
insert_marker_public = 'public injectLog'

# Handlers
handlers_block = """  private handleRegisterNfcScanStart(): Uint8Array {
    this.isNfcScanning = true;
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
  }

  private handleRegisterNfcTag(payload: Uint8Array): Uint8Array {
    if (payload.length < 9) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const len = payload[8];
    if (payload.length < 9 + len) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const uidBytes = payload.slice(9, 9 + len);
    const uid = bytesToHex(uidBytes).match(/.{1,2}/g)?.join(':') || '';

    this.nfcTags.add(uid);
    this.isNfcScanning = false;
    this.saveState();

    return this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED, new Uint8Array(0));
  }

  private handleUnregisterNfcTag(payload: Uint8Array): Uint8Array {
    if (payload.length < 9) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const len = payload[8];
    if (payload.length < 9 + len) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const uidBytes = payload.slice(9, 9 + len);
    const uid = bytesToHex(uidBytes).match(/.{1,2}/g)?.join(':') || '';

    if (this.nfcTags.has(uid)) {
      this.nfcTags.delete(uid);
      this.saveState();
    }

    return this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED, new Uint8Array(0));
  }
"""

# Public method
public_block = """  /**
   * Simulates an NFC tag scan.
   */
  public simulateNfcScan(uid: string): void {
    if (this.isNfcScanning) {
        // Notify found
        // Payload: Length (1) + UID
        const uidBytes = stringToBytes(uid.replace(/:/g, '')); // Assuming hex string with colons or without?
        // Actually, uid is usually hex string. stringToBytes converts string chars to bytes.
        // I should use hexToBytes. Wait, hexToBytes is imported?
        // Check imports.
        // If not imported, I might need to import it or implement it.
        // 'bytesToHex' is used in handlers. 'stringToBytes' is imported.
        // Let's assume 'hexToBytes' is available or I should parse it manually if simple.
        // Actually,  has .
        // I need to make sure it is imported in BoksSimulator.ts.
        // It is NOT in the imports I saw earlier: .
        // I will need to update imports first.
    }
  }
"""
