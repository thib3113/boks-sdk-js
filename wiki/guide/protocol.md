# BLE Protocol & Workflows

The Boks SDK communicates with the hardware via Bluetooth Low Energy (BLE) using a proprietary GATT service. Communication is asynchronous and based on an opcode-driven request/response model.

## GATT Services & Characteristics

| Service | UUID | Usage |
|---------|------|-------|
| **Boks Service** | `a7630001-f491-4f21-95ea-846ba586e361` | Main communication service |
| **Device Info** | `0000180a-0000-1000-8000-00805f9b34fb` | Versioning and hardware info |
| **Battery Service** | `0000180f-0000-1000-8000-00805f9b34fb` | Standard battery level |

### Characteristics (Boks Service)

- **Write** (`a7630002-...`): Used to send commands (**Downlink**).
- **Notify** (`a7630003-...`): Used by the device to send status updates and responses (**Uplink**).

---

## Packet Structure

All packets follow a consistent binary format:

`[Opcode (1 byte)] [Length (1 byte)] [Payload (N bytes)] [Checksum (1 byte)]`

- **Opcode**: Identifies the command or notification type.
- **Length**: Number of bytes in the payload.
- **Payload**: The actual data (arguments or results).
- **Checksum**: 8-bit sum of all previous bytes (`sum & 0xFF`).

---

## Operational Workflows

### 1. Code Management
The device handles three distinct types of access codes:

*   **Master Codes**: Permanent PINs stored in 5 dedicated slots (0-4).
*   **Single-Use Codes**: Temporary PINs that expire immediately after one successful opening.
*   **Multi-Use Codes**: Reusable temporary PINs. *Note: Generation of these codes is disabled in firmware versions > 4.3.3.*

**Authentication**: Most code operations (Create, Edit, Delete) require a **ConfigKey** (8 bytes) at the beginning of the payload to authorize the change.

### 2. Burst History Transfer (The "Burst")
When history is requested (`0x03 REQUEST_LOGS`), the device enters a high-speed notification mode:

1.  The client sends `0x03`.
2.  The device sends a sequence of notification packets, one for each recorded event.
3.  Each event payload starts with a **3-byte Age** (seconds since the event occurred, Big Endian).
4.  The sequence **always** ends with a `0x92 END_HISTORY` packet.

### 3. NFC Tag Workflow
Registering an NFC tag is a two-step "Discovery" process:

1.  **Scan**: Send `0x17 REGISTER_NFC_TAG_SCAN_START`. The device LED usually flashes.
2.  **Detection**: When a tag is presented, the device emits `0xC5 NOTIFY_NFC_TAG_FOUND` containing the raw UID.
3.  **Registration**: To persist the tag, the client must send `0x18 REGISTER_NFC_TAG` with the UID and the **ConfigKey**.

---

## Command Registry (Common Opcodes)

### Control & Status
| Opcode | Name | Payload |
|--------|------|---------|
| `0x01` | OPEN_DOOR | `[PIN(6)]` |
| `0x02` | ASK_DOOR_STATUS | (Empty) |
| `0x06` | REBOOT | (Empty) |
| `0x08` | TEST_BATTERY | (Empty) |

### Administrative (Requires ConfigKey)
| Opcode | Name | Payload |
|--------|------|---------|
| `0x11` | CREATE_MASTER_CODE | `[Key(8)] [PIN(6)] [Index(1)]` |
| `0x12` | CREATE_SINGLE_USE | `[Key(8)] [PIN(6)]` |
| `0x0D` | DELETE_SINGLE_USE | `[Key(8)] [PIN(6)]` |
| `0x16` | SET_CONFIGURATION | `[Key(8)] [Type(1)] [Value(1)]` |

### Notifications (Uplink)
| Opcode | Name | Description |
|--------|------|-------------|
| `0x77` | SUCCESS | Command acknowledged. |
| `0x78` | ERROR | Command failed (usually auth or format). |
| `0x81` | VALID_PIN | The door is opening. |
| `0x82` | INVALID_PIN | Access denied. |
| `0x84` | DOOR_STATUS | `0x00` (Closed) / `0x01` (Open). |
| `0xC3` | CODES_COUNT | `[Master(2)] [Others(2)]` (Big Endian). |

---

## Experimental Features (Scale)
Recent firmware versions support an integrated scale (`0x50` to `0x62`). These commands allow bonding a Boks Scale, taring, and retrieving real-time weight measurements.
