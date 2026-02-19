# Boks SDK JS

Core SDK for Boks Parcel Box communication, PIN generation, and protocol handling.

## Features
- **PIN Algorithm**: Local implementation of the proprietary Boks PIN generation (BLAKE2s based).
- **Protocol Handling**: Comprehensive enum of Boks BLE opcodes and packet builders.
- **Provisioning**: Support for Master Key regeneration (Opcodes 0x20/0x21).
- **Multi-platform**: ESM, UMD, and IIFE support.
- **Tree-shaking Friendly**: Dedicated core entry point for lighter bundles.

## Installation
```bash
pnpm add @thib3113/boks-sdk
```

## Usage

### Full SDK (Default)
Includes everything: Client (WebBluetooth), Protocol, Crypto, and Utilities.

```javascript
import { BoksClient, BoksPacketFactory, generateBoksPin } from '@thib3113/boks-sdk';

// Initialize the client
const client = new BoksClient();

// Generate a PIN locally
const pin = generateBoksPin(masterKeyBytes, 'single-use', 0);
```

### Core Only (Lighter Bundle)
If you only need the protocol definitions, PIN generation, or utilities *without* the WebBluetooth client implementation, use the `core` entry point. This significantly reduces bundle size.

```javascript
import { BoksPacketFactory, generateBoksPin } from '@thib3113/boks-sdk/core';

// Create a BLE packet
const packet = BoksPacketFactory.createCreateMaster('ABCDEFGH', 0, '123456');
const bytes = packet.encode();
```

## Usage (Standalone HTML / IIFE)

### Full SDK
```html
<script src="https://unpkg.com/@thib3113/boks-sdk/dist/boks-sdk.js"></script>
<script>
  const client = new BoksSDK.BoksClient();
</script>
```

### Core Only
```html
<script src="https://unpkg.com/@thib3113/boks-sdk/dist/boks-core.js"></script>
<script>
  const pin = BoksSDK.generateBoksPin(key, 'master', 1);
  // BoksSDK.BoksClient is undefined here
</script>
```
