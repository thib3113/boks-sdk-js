# Initialization Demo

<BoksGlobalProvider />

This interactive tool allows you to safely generate a **Master Key** and initialize a Boks device.

::: danger CRITICAL WARNING
**This operation is irreversible without the Master Key.**
The Master Key generated here is **stored in your browser's LocalStorage**.
If you clear your browser data or lose this key, you will permanently lose administrative access to your device.
**Always back up your key immediately after generation.**
:::

<InitializationDemo />

## How to Use

1.  **Connect**: Click "Scan & Connect" and select your Boks device.
2.  **Generate Key**: If you don't have a key, generate one. It will be saved automatically.
3.  **Initialize**: Once connected and a key is active, click "Initialize Device".

::: tip Note
This tool uses the Web Bluetooth API and requires a compatible browser (Chrome, Edge, Opera) and Bluetooth hardware.
:::

<BoksPacketLogger />
