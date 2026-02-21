# Specification: Boks Hardware Simulator

## Overview
The Boks Simulator is a high-fidelity hardware mock designed to allow full SDK integration testing without physical hardware. It consists of two parts:
1. **`BoksSimulator`**: The core logic engine that maintains state and emulates firmware behavior.
2. **`SimulatorTransport`**: A bridge implementing the `BoksTransport` interface, acting as a virtual BLE GATT server.

---

## 1. Core Logic: `BoksSimulator`

### Internal State
The simulator MUST maintain an internal state object including:
- `isOpen`: boolean
- `batteryLevel`: number (0-100)
- `pinCodes`: Map<string, 'master' | 'single' | 'multi'>
- `logs`: Array<{opcode: number, timestamp: number, payload: Uint8Array}>
- `configKey`: string (8 chars)
- `softwareVersion`: string (default "4.6.0")
- `firmwareVersion`: string (default "10/125")

### Mandatory Setters (Force Behavior)
For every functional aspect, the simulator MUST provide a public setter to force state or behavior:
- `setDoorStatus(open: boolean)`: Forces the door state.
- `setBatteryLevel(level: number)`: Forces battery level.
- `addPinCode(code: string, type: string)`: Manually injects a valid PIN.
- `setVersion(software: string, firmware: string)`: Overrides reported versions.
- `setPacketLoss(probability: number)`: Sets probability (0-1) of dropping incoming/outgoing packets.
- `setResponseDelay(ms: number)`: Adds artificial latency to responses.
- `setOpcodeOverride(opcode: number, responsePayload: Uint8Array | Error)`: Forces a specific response or error for a given opcode.

### Command Emulation (Default Behaviors)
If no override is set, the simulator follows these rules:
- **`0x01` (OPEN_DOOR)**: 
    - If PIN exists in `pinCodes`: Return `0x81`, set `isOpen = true`.
    - Else: Return `0x82`.
    - *Auto-close*: If opened, automatically close after 10s (set `isOpen = false` and add `0x90` log).
- **`0x02` (ASK_DOOR_STATUS)**: Return `0x84` or `0x85` with payload `[isOpen ? 0x00 : 0x01, isOpen ? 0x01 : 0x00]`.
- **`0x03` (REQUEST_LOGS)**: 
    - Iterate through `logs`.
    - For each log, calculate `age = (Date.now() - log.timestamp) / 1000`.
    - Emit log packets one by one (50ms interval).
    - Emit `0x92` (END_HISTORY) at the end.
- **`0x14` (COUNT_CODES)**: Return `0xC3` with current counts immediately.
- **`0x0D` (DELETE_SINGLE_USE)**: **REPRODUCE KNOWN BUG**.
    - Find and remove code from `pinCodes`.
    - **MUST return `0x78` (CODE_OPERATION_ERROR)** even if deletion is successful.

---

## 2. Bridge: `SimulatorTransport`

### GATT Emulation
`read(uuid)` MUST return data from the simulator state:
- `0x2A19`: `Uint8Array([state.batteryLevel])`
- `0x2A28`: `TextEncoder().encode(state.softwareVersion)`
- `0x2A26`: `TextEncoder().encode(state.firmwareVersion)`

### Packet Handling
- `write(data)`:
    1. Validate Checksum (Opcode + Length + Payload).
    2. Extract Opcode and Payload.
    3. If `packetLoss` triggers, ignore the write.
    4. Otherwise, pass to `BoksSimulator.handlePacket`.
- `subscribe(callback)`: Register the callback to receive notifications emitted by the simulator.

---

## 3. Architecture & Exports

### File Structure
- `src/simulator/BoksSimulator.ts`
- `src/simulator/SimulatorTransport.ts`
- `src/simulator.ts` (Entry point for the simulator module)

### Export Strategy
The simulator MUST NOT be exported by `src/index.ts`. It must have its own entry point to remain an optional dependency.
In `package.json`:
```json
"exports": {
  ".": "./dist/boks-sdk.js",
  "./simulator": "./dist/simulator.js"
}
```

---

## 4. Testing Requirements
A new test file `tests/simulator/SimulatorIntegrity.test.ts` MUST be created to verify:
1. That `setCredentials` and `setCredentials` work correctly via the simulator.
2. That the Opcode `0x0D` bug is correctly reproduced (returns `false` but code is gone).
3. That forced state (via setters) correctly overrides default emulation logic.
