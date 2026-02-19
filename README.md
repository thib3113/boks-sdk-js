# Boks SDK JS

Core SDK for Boks Parcel Box communication, PIN generation, and protocol handling.

## Features
- **PIN Algorithm**: Local implementation of the proprietary Boks PIN generation (BLAKE2s based).
- **Protocol Handling**: Comprehensive enum of Boks BLE opcodes and packet builders.
- **Provisioning**: Support for Master Key regeneration (Opcodes 0x20/0x21).
- **Multi-platform**: ESM, UMD, and IIFE support.

## Installation
```bash
pnpm add @thib3113/boks-sdk
```

## Usage (Web / ESM)
```javascript
import { BoksPacketFactory, generateBoksPin } from '@thib3113/boks-sdk';

// Generate a PIN locally
const pin = generateBoksPin(masterKeyBytes, 'single-use', 0);

// Create a BLE packet
const packet = BoksPacketFactory.createCreateMaster('ABCDEFGH', 0, '123456');
const bytes = packet.encode();
```

## Usage (Client / Code Splitting)
The `BoksClient` is a powerful but optional feature. To ensure it doesn't add unnecessary weight to your bundle if you only need the PIN/Protocol features, we recommend importing it from its dedicated entry point.

```javascript
import { BoksClient } from '@thib3113/boks-sdk/client';

// Use the client
const client = new BoksClient();
```

## Usage (Standalone HTML / IIFE)
```html
<script src="https://unpkg.com/@thib3113/boks-sdk/dist/boks-sdk.js"></script>
<script>
  const pin = BoksSDK.generateBoksPin(key, 'master', 1);
</script>
```
