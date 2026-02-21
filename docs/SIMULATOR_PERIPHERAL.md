# Creating a Virtual Boks Peripheral with Node.js and Bleno

The `BoksHardwareSimulator` is decoupled from browser-specific APIs, making it possible to run a high-fidelity Boks simulation on real hardware (like a Raspberry Pi) using [bleno](https://github.com/noble/bleno). This allows you to create a "Virtual Boks" that real Boks apps (iOS/Android/Web) can connect to and interact with.

## Prerequisites

- Node.js (v18+)
- Linux environment with Bluetooth support (BlueZ 5.x)
- `bleno` system dependencies:
  ```bash
  sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
  ```

## Setup

1.  **Install Dependencies**:

    ```bash
    npm install bleno @thib3113/boks-sdk
    ```

2.  **Create the Virtual Peripheral Script**:

    Create a file named `virtual-boks.js`. The following example demonstrates how to map the simulator's `getGattSchema()` to `bleno` classes.

## Example Implementation

```javascript
const bleno = require('bleno');
const { BoksHardwareSimulator } = require('@thib3113/boks-sdk/simulator');
// Note: You might need to import constants if you want to use them directly,
// but the schema provides UUIDs.

// 1. Initialize the Simulator
// You can pass a custom storage adapter here for persistence (e.g., using fs).
const simulator = new BoksHardwareSimulator();

// Configure initial state
simulator.setBatteryLevel(90);

// Set the Master Key (Important: This allows the client to authenticate)
// You can provide a hex string (64 chars) or Uint8Array.
// For example, this corresponds to a test master key.
simulator.setMasterKey('00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF');

// Add a Single Use code '123456'
simulator.addPinCode('123456', 0);

console.log('Boks Simulator Initialized.');

// 2. Map Simulator Schema to Bleno
const schema = simulator.getGattSchema();

const services = schema.map(serviceDef => {
    const characteristics = serviceDef.characteristics.map(charDef => {

        // Define the Characteristic Class
        class SimCharacteristic extends bleno.Characteristic {
            constructor() {
                super({
                    uuid: charDef.uuid,
                    properties: charDef.properties,
                    value: charDef.initialValue ? Buffer.from(charDef.initialValue) : null
                });
                this._updateValueCallback = null;
                this._notificationHandler = null;
            }

            onWriteRequest(data, offset, withoutResponse, callback) {
                console.log(`[Write] ${charDef.uuid}: ${data.toString('hex')}`);

                // Forward to Simulator
                simulator.handlePacket(new Uint8Array(data))
                    .then(() => {
                        callback(bleno.Characteristic.RESULT_SUCCESS);
                    })
                    .catch(err => {
                        console.error('Write error:', err);
                        callback(bleno.Characteristic.RESULT_UNLIKELY_ERROR);
                    });
            }

            onReadRequest(offset, callback) {
                 // For static values (battery, revision), the 'value' property is usually enough for bleno.
                 // But if dynamic logic is needed, we could map it here.
                 // The schema 'initialValue' handles static cases.
                 // For dynamic reads not covered by 'initialValue', you'd need custom logic mapping UUIDs.
                 // However, Boks protocol is mostly Write/Notify, except specific standard characteristics.
                 console.log(`[Read] ${charDef.uuid}`);
                 callback(bleno.Characteristic.RESULT_SUCCESS, this.value);
            }

            onSubscribe(maxValueSize, updateValueCallback) {
                console.log(`[Subscribe] ${charDef.uuid}`);
                this._updateValueCallback = updateValueCallback;

                if (charDef.properties.includes('notify')) {
                    // Subscribe to Simulator Output
                    this._notificationHandler = (data) => {
                        console.log(`[Notify] ${charDef.uuid}: ${Buffer.from(data).toString('hex')}`);
                        if (this._updateValueCallback) {
                            this._updateValueCallback(Buffer.from(data));
                        }
                    };
                    simulator.subscribe(this._notificationHandler);
                }
            }

            onUnsubscribe() {
                console.log(`[Unsubscribe] ${charDef.uuid}`);
                this._updateValueCallback = null;
                if (this._notificationHandler) {
                    simulator.unsubscribe(this._notificationHandler);
                    this._notificationHandler = null;
                }
            }
        }

        return new SimCharacteristic();
    });

    return new bleno.PrimaryService({
        uuid: serviceDef.uuid,
        characteristics: characteristics
    });
});

// 3. Start Bleno
bleno.on('stateChange', (state) => {
    console.log(`Bleno state: ${state}`);
    if (state === 'poweredOn') {
        const name = 'Boks Simulator';
        const serviceUuids = services.map(s => s.uuid);

        bleno.startAdvertising(name, serviceUuids, (err) => {
            if (err) console.error(err);
            else console.log('Advertising started...');
        });
    } else {
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', (err) => {
    if (!err) {
        console.log('Advertising start success');
        bleno.setServices(services, (err) => {
             if(err) console.error('Set services error', err);
             else console.log('Services configured');
        });
    } else {
        console.error('Advertising start error', err);
    }
});
```

## Storage Persistence (Node.js)

To persist simulator state (PIN codes, logs) across restarts in Node.js, implement the `SimulatorStorage` interface using `fs`:

```typescript
import * as fs from 'fs';
import { SimulatorStorage } from '@thib3113/boks-sdk/simulator';

class FileStorage implements SimulatorStorage {
    private path: string;

    constructor(path: string) {
        this.path = path;
    }

    get(key: string): string | null {
        try {
            if (!fs.existsSync(this.path)) return null;
            const data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
            return data[key] || null;
        } catch {
            return null;
        }
    }

    set(key: string, val: string): void {
        let data: any = {};
        try {
            if (fs.existsSync(this.path)) {
                data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
            }
        } catch {}

        data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
    }
}

const simulator = new BoksHardwareSimulator(new FileStorage('./boks-data.json'));
```
