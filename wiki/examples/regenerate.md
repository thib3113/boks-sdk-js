# Provisioning (Regenerate Key) Demo

<BoksGlobalProvider />

This interactive tool allows you to safely generate a new **Master Key** and provision it to an already initialized Boks device.

::: danger CRITICAL WARNING
**This operation replaces the existing Master Key.**
The new Master Key generated here will be **stored in your browser's LocalStorage**.
If you lose this new key, you will permanently lose administrative access to your device.
**Always back up your new key immediately after generation.**
:::

<RegenerateKeyDemo />

## How to Use

1.  **Connect**: Click "Scan & Connect" (or start the simulator) in the Global Controller below.
2.  **Authenticate**: Make sure you have the *current* Master Key active in the Vault.
3.  **Generate New Key**: Click "Generate New Random Key" to prepare a new key.
4.  **Provision**: Click "Provision New Key" to send it to the device. This process takes a few seconds.

::: tip Note
This tool uses the Web Bluetooth API and requires a compatible browser (Chrome, Edge, Opera) and Bluetooth hardware.
:::

<BoksPacketLogger />