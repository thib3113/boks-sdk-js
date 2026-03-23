# Offline PIN Generation

The Boks ecosystem allows generating access codes locally without any internet connection, provided you have the **Master Key** of the device. This ensures your parcel box remains fully functional even if the official Boks cloud is unavailable.

## How it works

Access codes (PINs) are derived from the 32-byte Master Key using a custom algorithm based on **BLAKE2s**. The hardware uses the same deterministic algorithm to validate the codes you type on the keypad.

For more details on the math, see the [PIN Algorithm Guide](../guide/pin-algorithm).

## Interactive Generator

Use this tool to generate valid PIN codes. If you are connected to the Simulator or a real Boks, your active Master Key will be pre-filled automatically.

<OfflinePinDemo />

## Usage in Code

You can use the `generateBoksPin` utility from the SDK to integrate this into your own application:

```typescript
import { generateBoksPin, hexToBytes } from '@thib3113/boks-sdk';

const masterKey = 'YOUR_64_CHAR_HEX_MASTER_KEY';
const keyBytes = hexToBytes(masterKey);

// Generate Master Code (index 0)
const masterPin = generateBoksPin(keyBytes, 'master', 0);
console.log(`Master PIN: ${masterPin}`);

// Generate a Single-Use code (index 123)
const singlePin = generateBoksPin(keyBytes, 'single-use', 123);
console.log(`Single-Use PIN: ${singlePin}`);
```

::: tip RECOVERY NOTE
If you lose your Master Key, you will no longer be able to generate offline codes. Always keep a secure backup of your key!
:::

<BoksDashboard />
