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
