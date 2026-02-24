import { BoksClient, BoksHistoryEvent, BoksOpcode } from '../src';

/**
 * Example function showing how to retrieve and display history from a Boks.
 */
async function listRecentEvents() {
  const client = new BoksClient();

  try {
    console.log('Connecting to Boks...');
    await client.connect();

    console.log('Fetching history events...');
    const events = await client.fetchHistory();

    console.log(`Successfully retrieved ${events.length} events:`);

    const now = Date.now();

    events.forEach((event, index) => {
      // Calculate absolute date from age
      const eventDate = new Date(now - event.age * 1000);
      let detail = '';

      // Note: Checking prototype/instanceof might need the specific class to be exported.
      // But we can also check opcodes.

      switch (event.opcode) {
        case BoksOpcode.LOG_DOOR_OPEN:
          detail = '🔓 Door Opened';
          break;
        case BoksOpcode.LOG_DOOR_CLOSE:
          detail = '🔒 Door Closed';
          break;
        case BoksOpcode.LOG_CODE_BLE_VALID:
          // Need to cast to access 'code' property if typescript is strict
          // But here we are just logging.
          detail = `📱 BLE Access`;
          break;
        default:
          detail = `Event (Opcode: 0x${event.opcode.toString(16)})`;
      }

      console.log(`[${index}] ${eventDate.toLocaleString()} -> ${detail}`);
    });
  } catch (error) {
    console.error('Failed to fetch history:', error);
  } finally {
    await client.disconnect();
    console.log('Disconnected.');
  }
}

// Usage:
// listRecentEvents();
