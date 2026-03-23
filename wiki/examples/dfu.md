# Firmware Update (DFU) Demo

This page demonstrates how to interactively flash firmware to a Boks device via Web Bluetooth using the `web-bluetooth-dfu` protocol.

> **Warning:** Flashing incorrect firmware can brick your device. Make sure you use a valid `.zip` firmware specifically built for your Boks device model.

<DfuDemo />

## How it works

The update process consists of two stages:

1. **Information Gathering & Mode Triggering:**
   - Connect to the Boks device.
   - Read basic hardware/software information from standard BLE characteristics (`0x180A`).
   - Write `0x01` to the DFU control characteristic (`0xFE59` -> `8ec90001...`) to restart the device in DFU mode.

2. **Flashing the Image:**
   - The device reconnects advertising a `DfuTarg` or `Boks-xxx` name.
   - We extract the `initData` and `firmwareData` from the provided `.zip`.
   - The `@thib3113/web-bluetooth-dfu` library manages the payload chunks, validating CRC, and writing to the DFU data characteristics.
