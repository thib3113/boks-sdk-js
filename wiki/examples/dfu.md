# Firmware Update (DFU)

This interactive demo allows you to update the firmware on your Boks device. It uses the `@thib3113/web-bluetooth-dfu` library to securely flash Nordic Semiconductor `.zip` update packages.

::: warning Secure Context Required
Web Bluetooth requires a secure context. You must access this page via HTTPS (or localhost) for the update to work.
:::

## How It Works

The firmware update is a two-step process:

1. **Preparation (Normal Mode)**:
   - When you connect to your Boks device (e.g., `Boks-1234`), the tool reads current hardware, software versions, and battery level.
   - If the battery is below 20%, you'll be warned to change it before proceeding.
   - Pressing "Enter DFU Mode" writes `0x01` to the DFU control characteristic, causing the device to reboot into a specialized bootloader state.

2. **Flashing (DFU Mode)**:
   - Once the device reboots, it will advertise as `DfuTarg` or `Boks_DFU`.
   - You can immediately select your firmware `.zip` file and start the flashing process.
   - The device will reboot back to normal operation once the transfer is verified and complete.

## Crucial FAQ & Safety Information

::: danger Recovery from Interruption
Not all Boks devices recover from an interrupted DFU in the same way.

* **Boks V3 (nRF52811)**: If the update is interrupted (browser closed, power loss), the device will be **temporarily unavailable** and stuck in update mode. It stays in the bootloader state, preventing any normal interaction until a successful flash is performed.
* **Boks V4 (nRF52833)**: The bootloader on newer devices handles interruptions more gracefully. A battery pull (removing and re-inserting the batteries) can usually recover the device to its previous state.
:::

**Q: Can I flash an older version (downgrade)?**
A: Usually, no. The bootloader contains downgrade protection (Error `0x0E`). You can only flash versions equal to or greater than your current installation.

**Q: What happens if I flash a firmware not signed by Boks?**
A: The DFU bootloader requires cryptographically signed firmware packages. Flashing unsigned or improperly signed zips will result in an Authentication Error (`0x0C`).

<DfuDemo />

<BoksDashboard />
