# Known Bugs & Protocol Quirks

Reverse engineering real hardware often reveals undocumented behaviors or bugs. This page lists the known quirks of the Boks firmware that developers should be aware of when implementing custom clients.

## 1. Deleting Single-Use Codes (Opcode 0x0D)

When sending a command to delete a single-use code via Bluetooth (Opcode `0x0D`), the hardware behavior is inconsistent with the rest of the protocol.

- **The Quirk**: Even if the code is **successfully deleted** from the device's internal storage, the firmware returns a `CODE_OPERATION_ERROR` (`0x78`) instead of a success notification.

## 2. ConfigKey Encoding & Transmission

The **ConfigKey** authentication mechanism uses a specific format that differs from standard binary protocols.

- **ASCII Transmission**: Although the ConfigKey is a hexadecimal representation of 4 bytes, it is **always transmitted as an 8-character ASCII string** in the payload of authenticated packets. This is less efficient than sending the raw 4 bytes but is strictly required by the firmware parser.
- **Byte Order (Endianness)**: The firmware expects the 8-character hex string to be transmitted in **Little Endian hex ASCII**, but then re-sequences it internally before comparison.
- **Example**: If your key is `AABBCCDD`, it might need to be sent as `DDCCBBAA` depending on the opcode and firmware version.

## 3. Master Key Volatility (Flash Masking)

The Boks hardware does not store the complete 32-byte **Master Key** in its long-term flash memory.

- **The Quirk**: When a Master Key is provided (via provisioning or regeneration), the hardware uses the full key to derive the initial pool of codes. However, before persisting the key to the Flash Data Storage (FDS), it **zeroes out several bytes** (usually the first 8 bytes).
- **Consequence**: This means the hardware cannot "re-generate" its own codes pool from its internal storage if they are lost; the full key must be provided again by the client for any regeneration operation.

## 4. History Age Precision

The 3-byte age field in history events (`0x03` burst) is calculated by the firmware relative to its internal uptime.

- **The Quirk**: If the device reboots, the uptime is reset. The age reported for events prior to the reboot might be calculated incorrectly or based on a legacy timestamp if the RTC (Real Time Clock) was not synchronized.
- **Consequence**: The absolute date must be calculated by subtracting the age from the current time at the moment of reception.

## 5. Multi-Use Code Generation

As noted in the [Protocol Guide](./protocol), firmware versions strictly greater than **4.3.3** have disabled the generation of new Multi-Use codes.

- **The Quirk**: Sending a `CREATE_MULTI_USE_CODE` (`0x13`) on these versions will return an error, even if the payload and authentication are correct.
