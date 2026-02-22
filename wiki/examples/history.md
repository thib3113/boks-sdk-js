# History Sync

The Boks device maintains an internal log of events, including door openings, code usages (valid/invalid), system events (power on/off), and more. You can retrieve these logs using the `fetchHistory()` method.

## Usage

The `fetchHistory()` method returns a Promise that resolves to an array of `BoksHistoryEvent` objects. Each event contains:
- `date`: A calculated `Date` object representing when the event occurred (based on the event age).
- `opcode`: The `BoksOpcode` identifying the type of event.
- Specific fields depending on the event type (e.g., source of opening).

```typescript
import { BoksController, BoksOpcode } from '@thib3113/boks-sdk';

// ... connect to device ...

try {
  console.log('Fetching history...');
  const history = await controller.fetchHistory();

  console.log(`Retrieved ${history.length} events:`);

  history.forEach(event => {
    // Determine event type
    let description = 'Unknown Event';

    switch (event.opcode) {
      case BoksOpcode.LOG_DOOR_OPEN:
        description = 'Door Opened';
        break;
      case BoksOpcode.LOG_CODE_BLE_VALID:
        description = 'Valid Code (App)';
        break;
      // ... handle other opcodes
    }

    console.log(`[${event.date.toLocaleString()}] ${description}`);
  });

} catch (error) {
  console.error('Failed to sync history:', error);
}
```

## Interactive Demo

Use the tool below to connect to a Boks device and view its history log.

<HistoryDemo />
