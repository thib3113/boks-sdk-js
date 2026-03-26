import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to trigger a battery test.
 */
export class TestBatteryPacket extends BoksPacket {
  constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.TEST_BATTERY;
  get opcode() {
    return TestBatteryPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): TestBatteryPacket {
    return new TestBatteryPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
