# Seed Regeneration Demo

<BoksGlobalProvider minSw="4.5.1" />

::: warning CRITICAL WARNING
This software is currently **theoretical** and has **not been tested on real hardware**.
Using this regeneration process will likely **break compatibility with the official Boks app**.
Use at your own risk. This is reverse-engineered software.
:::

Use this interactive demo to replace the current Master Key with a new known seed, allowing you to generate offline codes. You can enter your current 8-character **Config Key** manually below, or have it automatically filled if you already connected to a session.

### Automatic Downloads during this process

To ensure your safety and provide the ability to investigate potential issues, this demo will trigger two automatic downloads:
1. **Before regeneration starts:** A `.txt` file containing your new Master Key will be downloaded. **Keep this file safe!** It is your only way to recover access if the process fails mid-way.
2. **Right after sending the key:** A log file containing the Bluetooth exchange will be downloaded automatically. If the process hangs, you can use this file to understand where it failed.

<RegenerationDemo />

### Troubleshooting

If you successfully completed the regeneration process but find that your newly generated offline codes **are rejected**, while your Config Key is still accepted by the Boks (e.g., via the dashboard or when regenerating again), you might be encountering a known issue with firmware >= 4.5.1.

On newer firmwares, the Boks may experience a Watchdog reset immediately after accepting the new key.

**Solution:** If this happens, try replacing the **first 16 characters** of your new 64-character Master Key with zeros (e.g., `0000000000000000<rest_of_the_key>`). Your codes should then work correctly.

<BoksDashboard />
