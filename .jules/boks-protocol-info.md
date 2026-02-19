# Boks Protocol Info

## UUIDs
- Service: a7630001-f491-4f21-95ea-846ba586e361
- Write: a7630002-f491-4f21-95ea-846ba586e361
- Notify: a7630003-f491-4f21-95ea-846ba586e361
- Device Info Service: 0000180a-0000-1000-8000-00805f9b34fb
- Firmware Revision (Internal): 00002a26-0000-1000-8000-00805f9b34fb
- Hardware Revision: 00002a27-0000-1000-8000-00805f9b34fb
- Software Revision: 00002a28-0000-1000-8000-00805f9b34fb

## Versions Logic
- FW '10/125' -> HW 4.0 (nRF52833)
- FW '10/cd' -> HW 3.0 (nRF52811)

## Opcodes (Downlink)
- 0x01: Open Door
- 0x02: Ask Door Status
- 0x03: Request Logs
- 0x06: Reboot
- 0x07: Get Logs Count
- 0x08: Test Battery
- 0x0C: Delete Master Code
- 0x0D: Delete Single Use Code
- 0x0E: Delete Multi Use Code
- 0x11: Create Master Code
- 0x12: Create Single Use Code
- 0x13: Create Multi Use Code
- 0x14: Count Codes (verify deletion on error 0x78)
- 0x16: Set Configuration (Enable NFC type 0x01)
- 0x17: Start NFC Scan
- 0x92: End History (Uplink)
