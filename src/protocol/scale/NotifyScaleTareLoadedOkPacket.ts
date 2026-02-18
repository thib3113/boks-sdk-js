import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale tare loaded OK.
 */
export class NotifyScaleTareLoadedOkPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_TARE_LOADED_OK;
  constructor() {
    super(NotifyScaleTareLoadedOkPacket.opcode);
  }
  parse() {}
}


