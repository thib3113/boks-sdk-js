# NFC Management


Boks devices with hardware version 4.0 or higher support NFC tags. This means you can use an NFC badge or tag to open the parcel box instead of a keypad code or a mobile application.

The SDK allows you to scan for new NFC tags, register them, and manage them using the `BoksController`.

## Scanning and Registering Tags

To register a new NFC tag, you first put the Boks into a scanning state. Once a tag is tapped, the device will report its ID, and you can then register it.

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// ... connect to device with master credentials ...

try {
  // 1. Scan for a new NFC Tag
  console.log('Place an NFC tag near the Boks reader...');

  // This function will wait until a tag is detected or a timeout occurs
  const scanResult = await controller.scanNFCTags();

  if (scanResult) {
    console.log(`Tag found! ID: ${scanResult.tagId}`);

    // 2. Register the scanned tag
    await scanResult.register();
    // Or you can do it directly with:
    // await controller.registerNFCTag(scanResult.tagId);

    console.log(`Tag ${scanResult.tagId} successfully registered to Boks!`);
  } else {
    console.log('No tag scanned within the timeout period.');
  }
} catch (error) {
  console.error('NFC scanning or registration failed:', error);
}
```

## Unregistering Tags

If an NFC tag is lost or no longer needs access, you can unregister it using its UID. You must know the UID of the tag to remove it, as the device does not provide a command to list all registered tags.

```typescript
try {
  const tagToRemove = '04:A1:B2:C3:D4:E5:F6'; // The known UID of the tag

  // Remove the tag from the Boks device
  console.log(`Unregistering NFC tag: ${tagToRemove}`);
  await controller.unregisterNFCTag(tagToRemove);

  console.log(`Tag ${tagToRemove} has been successfully removed.`);

} catch (error) {
  console.error('Failed to unregister NFC tag:', error);
}
```
