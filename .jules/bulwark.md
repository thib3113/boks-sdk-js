## 2025-03-08 - [Core] **Hardened:** src/protocol/BoksPacketFactory.ts **Edge-Cases Covered:** Arbitrary random payload rejections, out-of-bounds error handling.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/CreateMasterCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid arguments rejection, malformed binary payloads parser.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/OpenDoorPacket.ts **Edge-Cases Covered:** PIN validation mapping, malformed binary payloads parser.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/MasterCodeEditPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/SetConfigurationPacket.ts **Edge-Cases Covered:** Constructor fuzzing, boolean mappings, exact payload lengths, malformed binary buffers.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/UnregisterNfcTagPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid MAC addresses/UIDs parsing, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/AskDoorStatusPacket.ts **Edge-Cases Covered:** Empty payload verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/GenerateCodesPacket.ts **Edge-Cases Covered:** Constructor fuzzing, seed validation (Uint8Array and Hex formats), malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/TestBatteryPacket.ts **Edge-Cases Covered:** Empty payload verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/GetLogsCountPacket.ts **Edge-Cases Covered:** Empty payload verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/RegeneratePartAPacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/RegeneratePartBPacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/RequestLogsPacket.ts **Edge-Cases Covered:** Empty payload verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/GenerateCodesSupportPacket.ts **Edge-Cases Covered:** Constructor fuzzing, seed validation (Uint8Array and Hex formats), malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/ReactivateCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, PIN validation, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/RebootPacket.ts **Edge-Cases Covered:** Empty payload verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/SingleToMultiCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, PIN validation, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/MultiToSingleCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, PIN validation, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/CreateMultiUseCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/CreateSingleUseCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/DeleteMasterCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/DeleteMultiUseCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/DeleteSingleUseCodePacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/NfcRegisterPacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/CountCodesPacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/downlink/RegisterNfcTagScanStartPacket.ts **Edge-Cases Covered:** Constructor fuzzing, exact byte part length verification, malformed binary payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/BleRebootHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/BlockResetHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/CodeBleInvalidHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/CodeBleValidHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/CodeKeyInvalidHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/CodeKeyValidHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/DoorCloseHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/DoorOpenHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/ErrorHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/HistoryEraseHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/KeyOpeningHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/NfcOpeningHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/NfcRegisteringHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/PowerOffHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/PowerOnHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/history/ScaleMeasureHistoryPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid lengths, malformed binary buffer payloads.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/NotifyDoorStatusPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid mappings, malformed binary buffers.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/NotifyCodesCountPacket.ts **Edge-Cases Covered:** Constructor fuzzing, missing lengths, malformed binary buffers.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/NotifyLogsCountPacket.ts **Edge-Cases Covered:** Constructor fuzzing, missing lengths, malformed binary buffers.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/AnswerDoorStatusPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid mappings, malformed binary buffers.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/NotifyNfcTagFoundPacket.ts **Edge-Cases Covered:** Constructor fuzzing, invalid empty payloads, malformed binary buffers.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/NotifyCodeGenerationProgressPacket.ts **Edge-Cases Covered:** Constructor fuzzing, trailing bytes, empty buffers.
## 2025-03-08 - [Core] **Hardened:** src/protocol/uplink/SimpleNotificationPackets.ts **Edge-Cases Covered:** Constructor fuzzing, empty buffers, invalid error payloads.
## 2026-03-08 - [Scale] **Hardened:** src/protocol/scale/ **Edge-Cases Covered:** arbitrary payload buffers, parsing lengths < 4, empty buffer graceful parsing
## 2026-03-09 - [Client] **Hardened:** src/client/BoksTransaction.ts **Edge-Cases Covered:** Fuzzing state transitions with concurrent random interactions.
## 2026-03-09 - [Core] **Hardened:** src/protocol/uplink/NfcNotificationPackets.ts **Edge-Cases Covered:** Constructor fuzzing, empty buffers, invalid error payloads.
## 2026-03-09 - [Client] **Hardened:** src/client/BoksClient.ts **Edge-Cases Covered:** Fuzzing the transaction queue with simulated concurrent requests, timeouts, and arbitrary notifications to ensure state resilience.
## 2024-03-09 - [Module Scale] **Hardened:** [Various Notification Packets] **Edge-Cases Covered:** [Simple Arbitrary Payload Resilience and default handling]
## 2024-03-09 - [Core/Uplink/History] **Hardened:** [All History Packets] **Edge-Cases Covered:** [Arbitrary payload lengths from 0 to 256 bytes ensuring parsing safety]
## 2026-03-10 - [Core/Uplink] **Hardened:** src/protocol/uplink/SimpleNotificationPackets.ts **Edge-Cases Covered:** [Arbitrary payload lengths from 0 to 256 bytes ensuring parsing safety, empty buffer handling, bounds checking]
## 2026-03-10 - [Client] **Hardened:** src/client/BoksController.ts **Edge-Cases Covered:** [Arbitrary inputs to `setCredentials` preventing state corruption and validation errors, fuzzed hardware string parsing for internal logic, random inputs via `checkRequirements` for reliable SemVer parsing]
## 2026-03-10 - [Scale] **Hardened:** src/protocol/scale/ScaleTareEmptyPacket.ts, src/protocol/scale/ScaleTareLoadedPacket.ts **Edge-Cases Covered:** Arbitrary random payload buffer rejections, ensure exact data retention on toPayload.
## 2026-03-10 - [Core] **Hardened:** src/utils/converters.ts **Edge-Cases Covered:** hexToBytes arbitrary parsing, bytesToMac length handling, stringToBytes UTF-8 bounds, readConfigKeyFromBuffer out of bounds reading, readPinFromBuffer out of bounds reading, writeConfigKeyToBuffer out of bounds writing
## 2026-03-10 - [Core] **Hardened:** src/utils/validation.ts **Edge-Cases Covered:** String parsing bounds, malformed data typing for validateMacAddress, validatePinCode, validateConfigKeyFormat, validateNfcUid, arbitrary index validation limits.
## 2026-03-10 - [Core] **Hardened:** src/utils/battery.ts **Edge-Cases Covered:** parseBatteryLevel bounds checking, parseBatteryStats format lengths and out of bounds buffer parsing.
## 2026-03-10 - [Core] **Hardened:** src/utils/security.ts **Edge-Cases Covered:** Fuzzed Object.seal and Object.freeze without crashes.
## 2026-03-10 - [Client] **Hardened:** src/client/WebBluetoothTransport.ts **Edge-Cases Covered:** [Arbitrary payload lengths from 0 to 512 bytes ensuring parsing safety, graceful BoksClientError wrapping on Web Bluetooth failures]
## 2026-03-10 - [Core] **Hardened:** tests/core/resilience/uplink/SimpleNotificationPackets.fuzz.test.ts **Edge-Cases Covered:** [Explicit error assertions for BoksProtocolError, splitting tests for valid and invalid short payloads to prevent silent error suppression]
