# Boks SDK JS

The official JavaScript/TypeScript SDK for communicating with Boks Parcel Boxes. This library provides a high-level controller for managing connections, commands, and security, as well as low-level primitives for custom implementations.

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

The controller simplifies security by automatically deriving the necessary configuration keys from your Master Key. You do not need to manually calculate the `configKey`.

```typescript
// Set your 32-byte Master Key (hex string)
// The controller automatically extracts the Config Key (last 8 bytes) for administrative tasks.
controller.setCredentials('YOUR_MASTER_KEY_HEX_STRING_HERE');
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

```typescript
// Scan for NFC tags (requires HW >= 4.0)
const scanResult = await controller.scanNFCTags();
console.log(`Found tag: ${scanResult.tagId}`);
await scanResult.register(); // Register the found tag

// Fetch usage history
const logs = await controller.fetchHistory();
console.log(logs);
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

## Sponsor this Project

If you find this SDK useful, please consider sponsoring the project to support ongoing development and maintenance.

[Become a Sponsor](https://github.com/sponsors/thib3113)
