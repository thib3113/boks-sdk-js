// It looks like these functions ARE still used heavily by the Simulator,
// some dynamic packets (RegeneratePartAPacket, SetConfigurationPacket),
// AuthPacket.extractConfigKey, and History packets.
// But wait! If they are used, they should be covered by tests.
// Why was coverage dropping? Because we REMOVED their usage from many downlink packets that were previously generating them via toPayload!
// So the lines we deleted in `toPayload` of child packets actually REDUCED the execution frequency of these functions, maybe to 0 for `writePinToBuffer`?
// Let's check `writePinToBuffer`.
