import os

file_path = 'src/simulator/BoksSimulator.ts'
insert_marker = 'private async handleGenerateCodes'

code_block = """  private handleSetConfiguration(payload: Uint8Array): Uint8Array {
    if (payload.length < 10) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const rxConfigKey = bytesToString(payload.slice(0, 8));
    if (rxConfigKey !== this.configKey) return this.createResponse(BoksOpcode.CODE_OPERATION_ERROR, new Uint8Array(0));

    const configType = payload[8];
    const value = payload[9];

    // Assuming configType 0 or 1 relates to La Poste or general config.
    // User said it enables/disables La Poste scans.
    this.configuration.laPosteEnabled = (value === 0x01);
    this.saveState();

    return this.createResponse(BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS, new Uint8Array(0));
  }

  private handleReboot(): Uint8Array {
    this.addLog(BoksOpcode.BLE_REBOOT, new Uint8Array(0));
    return this.createResponse(BoksOpcode.CODE_OPERATION_SUCCESS, new Uint8Array(0));
  }

  private handleTestBattery(): Uint8Array {
    // Battery test logic usually updates internal state or just confirms.
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
