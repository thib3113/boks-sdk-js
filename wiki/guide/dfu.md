# Firmware Updates (DFU)

Boks devices can be updated wirelessly using the **Device Firmware Update (DFU)** protocol over Bluetooth. This allows the hardware to receive bug fixes and new features.

## Safety & Protection

The Boks update system is designed to be **protected**. The hardware uses signed firmware packages; if a user attempts to send a fake or invalid update packet, the Boks will refuse to install it.

## ⚠️ Critical Warning for Boks V3 (Non-NFC / nRF52811)

If you own a **Non-NFC Boks** (also known as Boks V3, running on the nRF52811 chip), please read this carefully:

*   **An invalid or interrupted update will delete the previous software.**
*   In this case, the Boks will remain stuck in "DFU Mode" (bootloader) waiting for a valid software update and **will never restart** on the old version.
*   You must provide a valid firmware file to restore functionality.

This behavior is different from the **NFC Boks** (V4 / nRF52833), which can safely roll back or restart on its previous software if an update fails.

## How to Update

### Using the SDK
The Boks SDK itself does not yet include a built-in DFU client. However, you can use the firmware files retrieved via the SDK with standard tools.

### Manual Update (Fallback)
If you have the firmware `.zip` package:
1.  Install the **nRF Connect for Mobile** app (available on Android and iOS).
2.  Put your Boks in DFU mode (this happens automatically when a DFU process is initiated, or after a failed update).
3.  Connect to the device (usually named `DfuTarg` or `Boks_DFU`).
4.  Upload the firmware `.zip` file using the DFU button in the app.
