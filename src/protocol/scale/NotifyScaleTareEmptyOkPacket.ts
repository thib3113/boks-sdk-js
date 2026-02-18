import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale tare empty OK.
 */
export class NotifyScaleTareEmptyOkPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK;
  constructor() {
    super(NotifyScaleTareEmptyOkPacket.opcode);
  }
  parse() {}
}


