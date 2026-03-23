# Hardware Health Diagnostic

<BoksGlobalProvider />

This interactive demo allows you to monitor the physical health of your Boks device using real-time sensor data.

## Features

- **Generic Battery**: The standard battery percentage reported by the device.
- **Internal Temperature**: The temperature inside the Boks housing (measured near the main board).
- **Detailed Voltages**: Real-time voltage measurement for each of the internal battery cells.

::: warning MOTOR OPERATION REQUIRED
The Boks firmware only updates the detailed voltage measurements after a motor operation (opening the door). If the values seem outdated or are not displayed, try clicking the "Open Door" button to trigger a refresh.
:::

<HardwareHealthDemo />

<BoksDashboard />
