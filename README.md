# Boks SDK JS

Core SDK for Boks Parcel Box communication, PIN generation, and protocol handling.

## Features
- **PIN Algorithm**: Local implementation of the proprietary Boks PIN generation (BLAKE2s based).
- **Protocol Handling**: Comprehensive enum of Boks BLE opcodes and packet builders.
- **Provisioning**: Support for Master Key regeneration (Opcodes 0x20/0x21).
- **Multi-platform**: ESM, UMD, and IIFE support.

## Installation
```bash
pnpm add @boks/sdk
```

## Usage (Web / ESM)
```javascript
import { BoksPacketFactory, generateBoksPin } from '@boks/sdk';

// Generate a PIN locally
const pin = generateBoksPin(masterKeyBytes, 'single-use', 0);

// Create a BLE packet
const packet = BoksPacketFactory.createCreateMaster('ABCDEFGH', 0, '123456');
const bytes = packet.encode();
```

## Usage (Standalone HTML / IIFE)
```html
<script src="dist/boks-sdk.iife.js"></script>
<script>
  const pin = BoksSDK.generateBoksPin(key, 'master', 1);
</script>
```
