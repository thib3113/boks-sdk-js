# NFC Management

<BoksGlobalProvider />

Boks devices with hardware version 4.0 or higher support NFC tags. This means you can use an NFC badge or tag to open the parcel box instead of a keypad code or a mobile application.

The SDK allows you to scan for new NFC tags, register them, and manage existing ones using the `BoksController`.

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
    // You can also provide a friendly name for the tag in your application
    await scanResult.register();

    console.log(`Tag ${scanResult.tagId} successfully registered to Boks!`);
  } else {
    console.log('No tag scanned within the timeout period.');
  }
} catch (error) {
  console.error('NFC scanning or registration failed:', error);
}
```

## Listing and Managing Tags

You can also list all currently registered NFC tags to review who has access. This allows you to remove tags if they are lost.

```typescript
try {
  // Retrieve the list of registered tags
  console.log('Fetching registered NFC tags...');
  const tags = await controller.listNFCTags();

  if (tags.length === 0) {
    console.log('No NFC tags registered yet.');
  } else {
    console.log(`Found ${tags.length} registered tags:`);

    tags.forEach((tag, index) => {
      console.log(`- Slot ${index + 1}: ${tag.tagId}`);
    });

    // Optionally, delete a tag (e.g., the first one found)
    const tagToDelete = tags[0];
    await tagToDelete.delete();
    console.log(`Tag ${tagToDelete.tagId} has been removed.`);
  }

} catch (error) {
  console.error('Failed to manage NFC tags:', error);
}
```

<BoksPacketLogger />
