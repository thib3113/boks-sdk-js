# Boks SDK JS (Unofficial)

[![NPM Version](https://img.shields.io/npm/v/@thib3113/boks-sdk?style=flat-square)](https://www.npmjs.com/package/@thib3113/boks-sdk)
[![NPM Downloads](https://img.shields.io/npm/dm/@thib3113/boks-sdk?style=flat-square)](https://www.npmjs.com/package/@thib3113/boks-sdk)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/@thib3113/boks-sdk?style=flat-square)](https://bundlephobia.com/package/@thib3113/boks-sdk)
[![TypeScript](https://img.shields.io/badge/Typed-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/thib3113/boks-sdk-js/ci.yml?style=flat-square)](https://github.com/thib3113/boks-sdk-js/actions)
[![License](https://img.shields.io/github/license/thib3113/boks-sdk-js?style=flat-square)](./LICENSE)
[![Documentation](https://img.shields.io/badge/docs-technical_manual-blue?style=flat-square)](https://thib3113.github.io/boks-sdk-js/)

A community-driven, high-fidelity JavaScript/TypeScript SDK for communicating with Boks Parcel Boxes.

## ✨ Key Features

- 💎 **Fully Typed**: Written in TypeScript with 100% type coverage for protocol and client.
- 📦 **Zero Dependencies**: Core logic is lightweight and has no external dependencies.
- 🧪 **High-Fidelity Simulator**: Develop and test without physical hardware.
- 🧩 **Modular Architecture**: Separate `core` and `client` entry points for optimized bundle size.
- 🌐 **Platform Agnostic**: Works in Browser (WebBluetooth), Node.js, and Mobile (Capacitor/Cordova).

👉 **[Read the Full Technical Manual (English & Français)](https://thib3113.github.io/boks-sdk-js/)**

> ⚠️ **Disclaimer:** This project is **not** affiliated with, endorsed by, or associated with the manufacturer of the Boks device. It is an independent open-source effort for interoperability. See [LEGALS.md](./LEGALS.md) for full details.

## Installation

```bash
pnpm add @thib3113/boks-sdk
```

## High-Level Usage (Recommended)

The `BoksController` is the primary entry point for interacting with Boks devices. It handles the complexity of the protocol, connection management, and state tracking.

### 1. Initialization & Connection

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// Initialize the controller (uses WebBluetooth by default in browsers)
const controller = new BoksController();

// Connect to a nearby Boks device
await controller.connect();
console.log('Connected to Boks!');
```

### 2. Authentication & Configuration

The controller simplifies security. You can provide either the full **Master Key** (which allows all operations) or just the **Configuration Key** (if that's all you have, for restricted administrative tasks).

**Option A: Using the Master Key (Recommended)**
The controller automatically extracts the Configuration Key from it.

```typescript
// Set your 32-byte Master Key (hex string)
controller.setCredentials('YOUR_MASTER_KEY_HEX_STRING_HERE');
```

**Option B: Using the Configuration Key Only**
If you don't possess the Master Key, you can still perform administrative tasks (like NFC management or history retrieval) by providing the Config Key directly. Note that some operations (like generating PINs locally) require the Master Key.

```typescript
// Set your Configuration Key (derived from Master Key or provided separately)
controller.setCredentials('YOUR_CONFIG_KEY_HEX_STRING_HERE');
```

### 3. Basic Operations

Once connected and authenticated (if required for the operation), you can send commands.

```typescript
// Open the door with a PIN code
const success = await controller.openDoor('123456');

if (success) {
  console.log('Door opened!');
} else {
  console.log('Invalid PIN.');
}

// Get the current door status
const isOpen = await controller.getDoorStatus();
console.log(`Door is ${isOpen ? 'Open' : 'Closed'}`);
```

### 4. Advanced Administrative Tasks

Administrative tasks like NFC management or history retrieval require the **Configuration Key** or the **Master Key**. See the [Retrieving Credentials](https://thib3113.github.io/boks-sdk-js/guide/credentials) guide for more details.

```typescript
// Scan for NFC tags (requires HW >= 4.0)
const scanResult = await controller.scanNFCTags();
console.log(`Found tag: ${scanResult.tagId}`);
await scanResult.register(); // Register the found tag

// Fetch usage history
const logs = await controller.fetchHistory();
console.log(logs);
```

## Custom Transports (Node.js / Cordova / React Native)

By default, `BoksController` uses the standard WebBluetooth API (Chrome/Edge/Bluefy). However, for environments without WebBluetooth (like Node.js, React Native, or Cordova), you can inject a custom transport layer.

### Example: Node.js with `noble`

You can implement the `BoksTransport` interface using libraries like `noble`.

```typescript
import { BoksController } from '@thib3113/boks-sdk';
import { NobleTransport } from './your-custom-transport'; // Your implementation of BoksTransport

// Inject the custom transport into the client options
const transport = new NobleTransport();
const controller = new BoksController({ transport });

await controller.connect();
```

### Example: Cordova / Capacitor

Similarly, you can wrap `cordova-plugin-ble-central` or `capacitor-community/bluetooth-le` in a class implementing `BoksTransport` and pass it to the controller.

## Browser / IIFE Usage

You can use the SDK directly in the browser via a CDN (like unpkg or jsdelivr) without a bundler.

```html
<!-- Full SDK (includes Client & Protocol) -->
<script src="https://unpkg.com/@thib3113/boks-sdk/dist/boks-sdk.js"></script>
<script>
  // Access via the global BoksSDK object
  const controller = new BoksSDK.BoksController();

  document.getElementById('connectBtn').onclick = async () => {
    await controller.connect();
    console.log('Connected!');
  };
</script>

<!-- Core Only (Protocol & Crypto, lighter) -->
<script src="https://unpkg.com/@thib3113/boks-sdk/dist/boks-core.js"></script>
<script>
  // Useful for generating PINs client-side without BLE dependencies
  const pin = BoksSDK.generateBoksPin(masterKeyBytes, 'single-use', 0);
</script>
```

## Core Only (Low-Level)

For environments where bundle size is critical (e.g., restricted IoT devices) or when you only need specific algorithms without the full client logic, you can import from the `core` entry point.

```typescript
import { BoksPacketFactory, generateBoksPin } from '@thib3113/boks-sdk/core';

// 1. Generate a PIN locally (BLAKE2s based)
// Useful for server-side generation or offline apps
const pin = generateBoksPin(masterKeyBytes, 'single-use', sequenceNumber);

// 2. Create raw BLE packets manually
const packet = BoksPacketFactory.createOpenDoorPacket('123456');
const bytes = packet.encode();
```

## Experimental Features

> ⚠️ **Warning:** These features are experimental and may change or be removed in future versions. Use with caution.

### Boks Scale

Support for the connected scale accessory.

```typescript
// Bond with the scale
await controller.bondScale();

// Get weight
const weight = await controller.getScaleWeight();
console.log(`Weight: ${weight}g`);
```

### Provisioning (Master Key Regeneration)

Mechanisms to regenerate the Master Key on the device.

```typescript
// Regenerate the Master Key (requires current credentials)
await controller.regenerateMasterKey(newMasterKeyBytes);

// Factory Initialization (requires seed, no auth)
await controller.initialize(seedBytes);
```

## Examples

Check the [wiki/examples/](./wiki/examples/) folder for complete scripts demonstrating various use cases:

- **Initialization**: How to initialize a brand new Boks device.
- **Updates**: How to perform firmware updates (if applicable).
- **Basic Usage**: Simple open/close operations.

## Hardware Simulator

The SDK includes a high-fidelity hardware simulator, `BoksHardwareSimulator`, designed for integration testing without a physical device. It accurately mimics the protocol state machine, including history logging, error conditions, and even specific [Hardware Quirks](https://thib3113.github.io/boks-sdk-js/guide/quirks) like the "Stuck Motor" behavior.

### Installation

The simulator is available via a dedicated entry point:

```typescript
import { BoksHardwareSimulator, SimulatorTransport } from '@thib3113/boks-sdk/simulator';
import { BoksController, BoksCodeType, BoksOpenSource } from '@thib3113/boks-sdk';
```

### Basic Usage

You can inject the simulator into the `BoksController` using a `SimulatorTransport`.

```typescript
// 1. Create the simulator
const simulator = new BoksHardwareSimulator();

// 2. Configure the simulator state
simulator.addPinCode('123456', BoksCodeType.Single); // Add a valid PIN
simulator.setBatteryLevel(85);

// 3. Create a transport linked to the simulator
const transport = new SimulatorTransport(simulator);

// 4. Use the controller as usual
const controller = new BoksController({ transport });
await controller.connect(); // Connects to the simulator immediately
await controller.openDoor('123456'); // Validates against simulator state
```

### Persistence (Storage)

You can persist the simulator's state (PINs, logs, configuration) by injecting a storage implementation.

```typescript
const storage = {
  get: (key) => localStorage.getItem('boks-sim-' + key),
  set: (key, val) => localStorage.setItem('boks-sim-' + key, val)
};

const simulator = new BoksHardwareSimulator(storage);
```

### Peripheral Mode (Node.js / Bleno)

You can also use the simulator to create a virtual Boks peripheral on Linux/Raspberry Pi that real clients can connect to. See the `BoksHardwareSimulator` class documentation for implementation details.

### Simulating Events

You can trigger hardware events programmatically to test your application's reaction to real-world scenarios.

```typescript
// Simulate a user opening the door via the Keypad
simulator.triggerDoorOpen(BoksOpenSource.Keypad, '123456');

// Simulate a physical key opening (no code)
simulator.triggerDoorOpen(BoksOpenSource.PhysicalKey);

// Verify that the history logs reflect these events
const history = simulator.getState().logs;
```

### Integration Testing

You can use the simulator to run full integration tests for your application logic without needing physical hardware. The simulator faithfully reproduces protocol behavior, including asynchronous notifications and state changes.

```typescript
import { BoksController } from '@thib3113/boks-sdk';
import { BoksHardwareSimulator, SimulatorTransport } from '@thib3113/boks-sdk/simulator';

// 1. Setup Simulator
const simulator = new BoksHardwareSimulator();
const transport = new SimulatorTransport(simulator);

// 2. Setup Controller with Simulator Transport
const controller = new BoksController({ transport });
await controller.connect();

// 3. Run Test Scenario
// Initialize device (Provisioning)
const seed = new Uint8Array(32).fill(0xAA); // 32-byte seed
await controller.initialize(seed);

// Authenticate using the seed (Controller derives keys)
controller.setCredentials(seed);

// Create a code and use it
await controller.createSingleUseCode('123456');
const success = await controller.openDoor('123456');

console.log('Door opened:', success); // true
```

## Sponsor this Project

If you find this SDK useful, please consider sponsoring the project to support ongoing development and maintenance.

[Become a Sponsor](https://github.com/sponsors/thib3113)

---

**Legal Note:** This software is provided "AS IS", without warranty of any kind. The author cannot be held responsible for any damage to your device. See [LEGALS.md](./LEGALS.md).
