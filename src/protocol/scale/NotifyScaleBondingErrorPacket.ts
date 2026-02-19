import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale bonding error.
 */
export class NotifyScaleBondingErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_ERROR;
  public errorCode: number = 0;

  constructor() {
    super(NotifyScaleBondingErrorPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length > 0) {
      this.errorCode = payload[0];
    }
  }
}
