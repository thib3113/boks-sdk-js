import { BoksClient } from '../src/client/BoksClient';
import { OpenDoorPacket } from '../src/protocol/OpenDoorPacket';
import { NotifyDoorStatusPacket } from '../src/protocol/NotifyDoorStatusPacket';
import { BoksOpcode } from '../src/protocol/BoksOpcode';

/**
 * Example function showing how to open a Boks door using the client.
 * The PIN code is mandatory here.
 */
async function openMyBoks(pin: string) {
    const client = new BoksClient();

    try {
        console.log('Connecting...');
        await client.connect();

        console.log('Sending open door command...');
        const command = new OpenDoorPacket(pin);
        await client.send(command);

        console.log('Waiting for confirmation...');
        const status = await client.waitForPacket<NotifyDoorStatusPacket>(BoksOpcode.NOTIFY_DOOR_STATUS);

        if (status.isOpen) {
            console.log('Success! Door is open.');
        } else {
            console.log('Failed to open door (still closed).');
        }

    } catch (error) {
        console.error('Operation failed:', error);
    } finally {
        await client.disconnect();
    }
}

// Usage:
// openMyBoks("123456");
