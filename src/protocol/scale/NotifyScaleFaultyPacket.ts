import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale faulty.
 */
export class NotifyScaleFaultyPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_FAULTY;
  public data: Uint8Array = new Uint8Array(0);

  constructor() {
    super(NotifyScaleFaultyPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    this.data = payload;
  }
}


