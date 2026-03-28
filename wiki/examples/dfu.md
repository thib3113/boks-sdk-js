# Firmware Update (DFU)

<ClientOnly>
  <DfuDemo />
</ClientOnly>

## Overview

Device Firmware Update (DFU) is the process of updating the internal software running on your Boks device. This tool allows you to perform this update directly from your browser using Web Bluetooth.

The update process consists of two main steps:

### Step 1: Preparation (Switching to DFU Mode)

In its normal operating state, the Boks device does not accept firmware updates directly for security and stability reasons.

1. First, connect to your Boks device using the global controller at the bottom of the screen.
2. The controller will verify your hardware version and battery level.
3. If the battery is healthy, click **"Switch to DFU mode"**.
4. The application will send a specific command (writing `0x01` to characteristic `8ec90001-f315-4f60-9fb8-838830daea50` of the DFU service `0000fe59-0000-1000-8000-00805f9b34fb`).
5. Your Boks will restart. It will now broadcast a different name: `DfuTarg` or `Boks_DFU`.

### Step 2: Flashing the Firmware

Once your device is in DFU mode, the interface will automatically switch to the flashing panel.

1. Select the firmware `.zip` file provided for your specific Boks hardware revision.
2. Click **"Start Flashing"**.
3. The browser will negotiate with the bootloader and begin transferring the firmware chunks.
4. **Do not close the tab or turn off your computer during this process.**

Once the transfer reaches 100%, the Boks will validate the firmware and reboot automatically into the new operating system.

---

## Safety & Troubleshooting

Firmware updates involve rewriting the core memory of the device. While the Boks hardware is designed to be resilient, interruptions can cause the device to become temporarily unavailable.

### Interrupted Updates

If the update process is interrupted (e.g., your computer goes to sleep, the browser tab is closed, or the Bluetooth connection drops), the behavior depends on your hardware version:

- **Boks V3 (nRF52811):** The device will be **temporarily unavailable** or "stuck in update mode" (`DfuTarg`). It will not respond to normal commands or the physical button. **Do not panic.** To restore it, simply reconnect to the `DfuTarg` device and successfully complete the flashing process from Step 2.
- **Boks V4 (nRF52833):** These devices handle interruptions more gracefully. Often, simply removing the batteries and reinserting them is enough to restore the device to its previous working state.

### Invalid Firmware Files

The bootloader will refuse to flash a firmware file that is corrupted or intended for a different hardware version. If you see an error like:

> "The firmware file is invalid or corrupted for this model."

or

> "This firmware is not compatible with your Boks hardware version."

Please verify that you have downloaded the correct `.zip` file for your specific Boks model (e.g., V3 vs V4).
