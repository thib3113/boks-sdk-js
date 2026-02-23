# Glossary

### Master Key
A 32-byte secret key that serves as the "root of trust" for a Boks device. It is used to derive all temporary PIN codes.

### Configuration Key (ConfigKey)
An 8-character hex string derived from the Master Key. It acts as an administrative password for sensitive BLE operations (e.g., creating codes, changing settings).

### Master Code
A permanent PIN code (6 characters) stored directly in one of the device's indexed slots (0-4).

### Single-Use Code
A temporary PIN code derived from the Master Key that becomes invalid after it has been used once to open the door.

### Multi-Use Code
A temporary PIN code derived from the Master Key that can be used multiple times.

### Uplink
Communication from the Boks hardware to the client (Smartphone or Link).

### Downlink
Communication from the client to the Boks hardware.
