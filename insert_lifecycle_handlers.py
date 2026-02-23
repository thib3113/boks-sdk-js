import os

file_path = 'src/simulator/BoksSimulator.ts'
insert_marker = 'private async handleGenerateCodes'

code_block = """  private handleDeleteMultiUseCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const pin = bytesToString(payload.slice(8, 14));
    if (this.pinCodes.has(pin)) {
      const type = this.pinCodes.get(pin);
      if (type === BoksCodeType.Multi) {
        this.pinCodes.delete(pin);
        this.saveState();
        return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
      }
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));
  }

  private handleSingleToMulti(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const pin = bytesToString(payload.slice(8, 14));
    if (this.pinCodes.has(pin) && this.pinCodes.get(pin) === BoksCodeType.Single) {
      this.pinCodes.set(pin, BoksCodeType.Multi);
      this.saveState();
      return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));
  }

  private handleMultiToSingle(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const pin = bytesToString(payload.slice(8, 14));
    if (this.pinCodes.has(pin) && this.pinCodes.get(pin) === BoksCodeType.Multi) {
      this.pinCodes.set(pin, BoksCodeType.Single);
      this.saveState();
      return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));
  }

  private handleReactivateCode(payload: Uint8Array): Uint8Array {
    if (payload.length < 14) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const pin = bytesToString(payload.slice(8, 14));
    if (this.pinCodes.has(pin)) {
      return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
    }
    return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));
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
