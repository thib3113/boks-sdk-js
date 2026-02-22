# Battery & Hardware

This example demonstrates how to retrieve hardware information and battery statistics from a Boks device.

<script setup>
import BatteryDemo from '../.vitepress/components/BatteryDemo.vue'
</script>

<BatteryDemo />

## Code Usage

You can access hardware information and battery levels using the `BoksController`.

### Hardware Information

When you connect to a device, the controller automatically retrieves the firmware revision and deduces the hardware version.

```typescript
import { BoksController } from 'boks-sdk';

const controller = new BoksController();
await controller.connect();

// Access cached hardware info
const info = controller.hardwareInfo;

if (info) {
  console.log('HW Version:', info.hardwareVersion); // e.g., "4.0"
  console.log('FW Revision:', info.firmwareRevision); // e.g., "10/125"
  console.log('Chipset:', info.chipset); // e.g., "nRF52833"
}
```

### Battery Levels

You can request the standard battery level (0-100%) or detailed statistics provided by the custom Boks service.

```typescript
// Standard Bluetooth Battery Level
const level = await controller.getBatteryLevel();
console.log(`Battery: ${level}%`);

// Detailed Boks Battery Statistics
const stats = await controller.getBatteryStats();

if (stats) {
  console.log(`Main Level: ${stats.level}%`);
  console.log(`Temperature: ${stats.temperature}°C`);

  // Advanced details (min, max, mean, etc.)
  console.log('Details:', stats.details);
}
```

::: tip Note
Battery statistics are read from a custom characteristic and provide more insight than the standard service, including temperature and historical measures.
:::
