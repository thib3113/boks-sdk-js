import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to trigger a battery test.
 */
export class TestBatteryPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.TEST_BATTERY;
  get opcode() {
    return TestBatteryPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
