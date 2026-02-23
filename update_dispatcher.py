import os

file_path = 'src/simulator/BoksSimulator.ts'
marker = '// Add more handlers as needed'

new_cases = """      case BoksOpcode.CREATE_MASTER_CODE:
        return this.handleCreateMasterCode(payload);
      case BoksOpcode.MASTER_CODE_EDIT:
        return this.handleEditMasterCode(payload);
      case BoksOpcode.DELETE_MASTER_CODE:
        return this.handleDeleteMasterCode(payload);
      case BoksOpcode.DELETE_MULTI_USE_CODE:
        return this.handleDeleteMultiUseCode(payload);
      case BoksOpcode.SINGLE_USE_CODE_TO_MULTI:
        return this.handleSingleToMulti(payload);
      case BoksOpcode.MULTI_CODE_TO_SINGLE_USE:
        return this.handleMultiToSingle(payload);
      case BoksOpcode.REACTIVATE_CODE:
        return this.handleReactivateCode(payload);
      case BoksOpcode.SET_CONFIGURATION:
        return this.handleSetConfiguration(payload);
      case BoksOpcode.REBOOT:
        return this.handleReboot();
      case BoksOpcode.TEST_BATTERY:
        return this.handleTestBattery();
      case BoksOpcode.REGISTER_NFC_TAG_SCAN_START:
        return this.handleRegisterNfcScanStart();
      case BoksOpcode.REGISTER_NFC_TAG:
        return this.handleRegisterNfcTag(payload);
      case BoksOpcode.UNREGISTER_NFC_TAG:
        return this.handleUnregisterNfcTag(payload);
"""

with open(file_path, 'r') as f:
    content = f.read()

if marker in content:
    content = content.replace(marker, new_cases)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Updated processOpcode successfully.")
else:
    print("Marker not found.")
