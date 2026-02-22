# Open Door Example

This example demonstrates how to open a Boks device using a PIN code.

## Interactive Demo

You can try opening the door using the simulator below, or connect to a real Boks device.

<OpenDoorDemo />

## Code Example

Below is the TypeScript code used to open the door.

```typescript
import { BoksController } from '@thib3113/boks-sdk';

async function openDoorExample() {
  // 1. Create the controller (defaults to WebBluetooth)
  const controller = new BoksController();

  try {
    // 2. Connect to the device
    console.log('Connecting...');
    await controller.connect();
    console.log('Connected!');

    // 3. Open the door with a PIN
    const pin = '123456';
    console.log(`Opening door with PIN: ${pin}`);

    const success = await controller.openDoor(pin);

    if (success) {
      console.log('Door opened successfully!');
    } else {
      console.error('Failed to open door. Invalid PIN?');
    }

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // 4. Disconnect
    await controller.disconnect();
  }
}
```
