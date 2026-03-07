# Code Management

Boks devices allow you to manage different types of keypad codes to open the door, such as Single-Use codes (for deliveries) and Multi-Use codes (for regular users). These codes can be generated and managed directly from the application using the `BoksController`.

## Generating Codes

You can create different types of codes depending on your needs. When you create a code, the SDK handles the secure exchange with the Boks device.

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// ... connect to device with administrative credentials (Config Key or Master Key) ...

try {
  // 1. Create a Single-Use Code (One-time delivery code)
  // This code will only work once on the keypad to open the door.
  const singleUseCode = '123456';
  await controller.createSingleUseCode(singleUseCode);
  console.log(`Single-use code ${singleUseCode} created successfully!`);

  // 2. Create a Multi-Use Code (Recurring user code)
  // This code can be used indefinitely on the keypad until revoked.
  const multiUseCode = '987654';
  await controller.createMultiUseCode(multiUseCode);
  console.log(`Multi-use code ${multiUseCode} created successfully!`);

  // 3. Create a Master Code
  // A Master Code is a permanent keypad code (usually up to 4 can exist, indexed 0-3).
  // Do not confuse this with the 32-byte cryptographic Master Key!
  // Master Codes can also be used to reset the device directly from the keypad.
  const masterCodeIndex = 0; // Slot index
  const masterCodePin = '000000';
  await controller.createMasterCode(masterCodeIndex, masterCodePin);
  console.log(`Master code updated at index ${masterCodeIndex}!`);

} catch (error) {
  console.error('Failed to manage codes:', error);
}
```

## Opening the Door via Bluetooth (App)

If the user is nearby with their smartphone, you don't need a keypad code. You can trigger an open command directly via Bluetooth. The `openDoor` function requires a valid PIN (either single-use, multi-use, or master) to authenticate the command.

```typescript
try {
  // Attempt to open the door via Bluetooth using a known code
  // The code acts as an authentication token for the BLE command
  const isOpened = await controller.openDoor('123456');

  if (isOpened) {
    console.log('Door opened successfully via Bluetooth!');
  } else {
    console.log('Failed to open door. Invalid code or device issue.');
  }

} catch (error) {
  console.error('Error during open command:', error);
}
```
