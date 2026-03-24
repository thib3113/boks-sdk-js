import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to trigger a battery test.
 */
export class TestBatteryPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.TEST_BATTERY;
  get opcode() {
    return TestBatteryPacket.opcode;
  }
  static fromRaw(payload: Uint8Array): TestBatteryPacket {
    return new TestBatteryPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
