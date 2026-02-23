import os

file_path = 'src/simulator/BoksSimulator.ts'
handlers_marker = 'private handleCreateMasterCode'
public_marker = 'public injectLog'

handlers_code = """  private handleRegisterNfcScanStart(): Uint8Array {
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

public_code = """  /**
   * Simulates an NFC tag scan.
   */
  public simulateNfcScan(uid: string): void {
    const cleanUid = uid.replace(/:/g, '');
    const uidBytes = hexToBytes(cleanUid);

    if (this.isNfcScanning) {
      // Notify Found
      // Payload: Length (1) + UID Bytes
      const payload = new Uint8Array(1 + uidBytes.length);
      payload[0] = uidBytes.length;
      payload.set(uidBytes, 1);
      this.emit(this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload));
    } else {
      // Normal scan
      // Check both formatted and unformatted UID
      if (this.nfcTags.has(uid) || this.nfcTags.has(cleanUid)) {
        this.triggerDoorOpen(BoksOpenSource.Nfc, cleanUid);
      } else {
        // Maybe log error if desired, but user didn't specify strict failure logging.
      }
    }
  }

"""

with open(file_path, 'r') as f:
    content = f.read()

# Insert handlers before marker
if handlers_marker in content:
    content = content.replace(handlers_marker, handlers_code + handlers_marker)
else:
    print("Handlers marker not found.")

# Insert public method before marker (or after)
# Let's insert before injectLog
if public_marker in content:
    content = content.replace(public_marker, public_code + public_marker)
else:
    print("Public marker not found.")

with open(file_path, 'w') as f:
    f.write(content)

print("Inserted NFC logic successfully.")
