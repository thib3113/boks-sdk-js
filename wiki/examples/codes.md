# Code Management

<BoksGlobalProvider />

Boks devices allow you to manage different types of codes to open the door, such as Single-Use codes (for deliveries) and Multi-Use codes (for regular users). These codes can be generated and managed directly from the application using the `BoksController`.

## Generating Codes

You can create different types of codes depending on your needs. When you create a code, the SDK handles the secure exchange with the Boks device.

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// ... connect to device with master credentials ...

try {
  // 1. Create a Single-Use Code (One-time delivery code)
  // This code will only work once to open the door.
  const singleUseCode = '123456';
  await controller.createSingleUseCode(singleUseCode);
  console.log(`Single-use code ${singleUseCode} created successfully!`);

  // 2. Create a Multi-Use Code (Recurring user code)
  // This code can be used indefinitely until revoked.
  const multiUseCode = '987654';
  // Note: createMultiUseCode handles checking for available slots and configuring the code.
  await controller.createMultiUseCode(multiUseCode);
  console.log(`Multi-use code ${multiUseCode} created successfully!`);

  // 3. Set a Master Code
  // The master code is a special code that also allows resetting other codes.
  const masterCode = '000000';
  await controller.setMasterCode(masterCode);
  console.log('Master code updated!');

} catch (error) {
  console.error('Failed to manage codes:', error);
}
```

## Opening the Door with a Code

Once a code is set (or even before, if using offline calculated PINs), you can use it to open the door via Bluetooth.

```typescript
try {
  // Attempt to open the door using the created code
  const isOpened = await controller.openDoor('123456');

  if (isOpened) {
    console.log('Door opened successfully!');
  } else {
    console.log('Failed to open door. Invalid code or device issue.');
  }

} catch (error) {
  console.error('Error during open command:', error);
}
```

<BoksPacketLogger />
