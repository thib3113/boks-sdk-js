import os

file_path = 'src/simulator/BoksSimulator.ts'
insert_marker = 'private async handleGenerateCodes'

code_block = """  private handleCreateMasterCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 15) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const pin = bytesToString(payload.slice(8, 14));
    const index = payload[14];

    this.masterCodes.set(index, pin);
    this.addPinCode(pin, BoksCodeType.Master);

    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
  }

  private handleEditMasterCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 15) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const index = payload[8];
    const newPin = bytesToString(payload.slice(9, 15));

    const oldPin = this.masterCodes.get(index);
    if (oldPin) {
      this.pinCodes.delete(oldPin);
    }

    this.masterCodes.set(index, newPin);
    this.addPinCode(newPin, BoksCodeType.Master);

    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
  }

  private handleDeleteMasterCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 9) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const index = payload[8];
    const pin = this.masterCodes.get(index);

    if (pin) {
      this.masterCodes.delete(index);
      this.pinCodes.delete(pin);
      this.saveState();
    }

    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
  }

"""

with open(file_path, 'r') as f:
    content = f.read()

if insert_marker in content:
    content = content.replace(insert_marker, code_block + insert_marker)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Inserted code successfully.")
else:
    print("Marker not found.")
