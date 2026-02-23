import os

file_path = 'src/simulator/BoksSimulator.ts'

# The existing simulateNfcScan method to replace
old_method = """  public simulateNfcScan(uid: string): void {
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
  }"""

new_method = """  public simulateNfcScan(uid: string): void {
    const cleanUid = uid.replace(/:/g, '').toUpperCase();
    const uidBytes = hexToBytes(cleanUid);
    const formattedUid = cleanUid.match(/.{1,2}/g)?.join(':') || '';

    if (this.isNfcScanning) {
      // Notify Found
      // Payload: Length (1) + UID Bytes
      const payload = new Uint8Array(1 + uidBytes.length);
      payload[0] = uidBytes.length;
      payload.set(uidBytes, 1);
      this.emit(this.createResponse(BoksOpcode.NOTIFY_NFC_TAG_FOUND, payload));
    } else {
      // Normal scan
      if (this.nfcTags.has(formattedUid)) {
        this.triggerDoorOpen(BoksOpenSource.Nfc, cleanUid);
      }
    }
  }"""

with open(file_path, 'r') as f:
    content = f.read()

if old_method in content:
    content = content.replace(old_method, new_method)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Updated simulateNfcScan successfully.")
else:
    print("Old method not found. Trying flexible match.")
    # Fallback to loose match if whitespace differs
    import re
    # Just overwrite the file if I can find the start/end
    # Or assume it was inserted correctly and maybe I made a typo in python string compared to previous script
    pass
