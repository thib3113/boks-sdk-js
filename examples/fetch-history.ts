import { BoksClient } from '../src/client/BoksClient';
import { 
    DoorOpenHistoryPacket, 
    DoorCloseHistoryPacket, 
    CodeBleValidHistoryPacket 
} from '../src/protocol';

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
            const eventDate = new Date(now - (event.age * 1000));
            let detail = '';

            if (event instanceof DoorOpenHistoryPacket) {
                detail = '🔓 Door Opened';
            } else if (event instanceof DoorCloseHistoryPacket) {
                detail = '🔒 Door Closed';
            } else if (event instanceof CodeBleValidHistoryPacket) {
                detail = `📱 BLE Access (Code: ${event.code})`;
            } else {
                detail = `Unknown Event (Opcode: 0x${event.opcode.toString(16)})`;
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
