# Code Management

Boks devices allow you to manage different types of keypad codes to open the door, such as Single-Use codes (for deliveries) and Multi-Use codes (for regular users). These codes can be generated and managed directly from the application using the `BoksController`.

## End-to-End Workflow: Master Code

Here is a complete example demonstrating the entire lifecycle of a code: creating a Master Code, using it to open the door via Bluetooth, waiting for the door to be opened and closed physically, retrieving the history to confirm the event, and finally deleting the code.

```typescript
import { BoksController, BoksOpcode } from '@thib3113/boks-sdk';

// ... connect to device with administrative credentials (Config Key or Master Key) ...

try {
  const masterCodeIndex = 0; // Slot index (0-3)
  const masterCodePin = '000000';

  // 1. Create a Master Code
  // A Master Code is a permanent keypad code.
  // Do not confuse this with the 32-byte cryptographic Master Key!
  console.log('1. Creating Master Code...');
  await controller.createMasterCode(masterCodeIndex, masterCodePin);
  console.log(`✅ Master code created at index ${masterCodeIndex}!`);

  // 2. Open the Door via Bluetooth
  // The code acts as an authentication token for the BLE command
  console.log('2. Opening the door via Bluetooth...');
  const isOpened = await controller.openDoor(masterCodePin);

  if (isOpened) {
    console.log('✅ Door unlocked successfully!');
  }

  // --- 🧍 User Interaction ---
  // At this point, the user physically pulls the door open, puts a parcel inside,
  // and pushes the door closed.
  console.log('   (Waiting for user to physically open and close the door...)');
  // -------------------------

  // 3. Fetch History to verify the event
  console.log('3. Fetching history logs...');
  const history = await controller.fetchHistory();

  // Find the most recent successful BLE opening event
  const lastBleOpen = history.find(e => e.opcode === BoksOpcode.LOG_CODE_BLE_VALID);

  if (lastBleOpen) {
    console.log(`✅ Verified! Door was opened via App at: ${lastBleOpen.date.toLocaleString()}`);
  }

  // 4. Clean up: Delete the code
  console.log('4. Deleting Master Code...');
  await controller.deleteMasterCode(masterCodeIndex);
  console.log(`✅ Master code at index ${masterCodeIndex} deleted.`);

} catch (error) {
  console.error('Failed in workflow:', error);
}
```

## Generating Other Codes

You can also create other types of codes depending on your needs:

```typescript
try {
  // Create a Single-Use Code (One-time delivery code)
  // This code will only work once on the keypad to open the door.
  const singleUseCode = '123456';
  await controller.createSingleUseCode(singleUseCode);

  // Create a Multi-Use Code (Recurring user code)
  // This code can be used indefinitely on the keypad until revoked.
  const multiUseCode = '987654';
  await controller.createMultiUseCode(multiUseCode);

  // Delete a Multi-Use code
  await controller.deleteMultiUseCode(multiUseCode);

} catch (error) {
  console.error('Failed to manage codes:', error);
}
```
