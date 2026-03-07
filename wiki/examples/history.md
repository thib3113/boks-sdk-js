# History Sync

<BoksGlobalProvider />

The Boks device maintains an internal log of events, including door openings, code usages (valid/invalid), system events (power on/off), and more. You can retrieve these logs using the `fetchHistory()` method.

## Interactive Demo

Use the tool below to connect to a Boks device and view its history log.

<HistoryDemo />

## Usage

The `fetchHistory()` method returns a Promise that resolves to an array of `BoksHistoryEvent` objects. These events are parsed directly from the hardware's internal log format.

### What data is retrieved?

Each `BoksHistoryEvent` contains specific fields that help you understand what happened:

- **`date`**: A calculated Javascript `Date` object representing when the event occurred. *Note: Since the Boks device doesn't have an absolute Real-Time Clock, the date is calculated backwards based on the "age" of the log at the moment of retrieval.*
- **`opcode`**: The exact `BoksOpcode` identifying the type of event (e.g., a valid code was entered, the door was physically opened).
- **`source`**: For door opening events, this indicates *how* the door was opened (e.g., `BoksOpenSource.Keypad`, `BoksOpenSource.PhysicalKey`, `BoksOpenSource.App`).
- **`rawData`**: The raw byte payload from the device, useful for debugging or advanced parsing.

### Code Example: Fetching and Interpreting Logs

Here is a detailed example of how to fetch the logs and interpret the most common events:

```typescript
import { BoksController, BoksOpcode, BoksOpenSource } from '@thib3113/boks-sdk';

// ... connect to device ...

try {
  console.log('Fetching history from the Boks device...');
  // Note: Fetching history requires administrative privileges (Configuration Key or Master Key)
  const history = await controller.fetchHistory();

  console.log(`Retrieved ${history.length} events:`);

  history.forEach(event => {
    let description = 'Unknown Event';

    switch (event.opcode) {
      // 🚪 Physical Door Events
      case BoksOpcode.LOG_DOOR_OPEN:
        description = `Door physically opened via ${getOpenSourceLabel(event.source)}`;
        break;
      case BoksOpcode.LOG_DOOR_CLOSE:
        description = 'Door physically closed';
        break;

      // ✅ Valid Access Events
      case BoksOpcode.LOG_CODE_BLE_VALID:
        description = 'Valid access granted via Bluetooth (App)';
        break;
      case BoksOpcode.LOG_CODE_KEYPAD_VALID:
        description = 'Valid code entered on Keypad';
        break;
      case BoksOpcode.LOG_CODE_NFC_VALID:
        description = 'Valid access granted via NFC Tag';
        break;

      // ❌ Denied Access Events
      case BoksOpcode.LOG_CODE_DENIED:
      case BoksOpcode.LOG_BLE_AUTH_FAILED:
        description = 'Access denied (Invalid code or failed authentication)';
        break;

      // ⚙️ System Events
      case BoksOpcode.LOG_WAKEUP_BUTTON:
        description = 'Device woke up (Button pressed)';
        break;
      case BoksOpcode.LOG_WAKEUP_BLE:
        description = 'Device woke up (Bluetooth connection)';
        break;
      default:
        description = `Other event (Opcode: 0x${event.opcode.toString(16).toUpperCase()})`;
    }

    console.log(`[${event.date.toLocaleString()}] ${description}`);
  });

} catch (error) {
  console.error('Failed to sync history:', error);
}

// Helper to translate the source enum into a readable string
function getOpenSourceLabel(source?: BoksOpenSource): string {
  switch (source) {
    case BoksOpenSource.App: return 'Mobile App (Bluetooth)';
    case BoksOpenSource.Keypad: return 'Keypad Code';
    case BoksOpenSource.Nfc: return 'NFC Tag';
    case BoksOpenSource.PhysicalKey: return 'Physical Override Key';
    case BoksOpenSource.Button: return 'Internal Exit Button';
    default: return 'Unknown Source';
  }
}
```

<BoksPacketLogger />
