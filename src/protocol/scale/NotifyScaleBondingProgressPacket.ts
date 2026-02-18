import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale bonding progress.
 */
export class NotifyScaleBondingProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS;
  public progress: number = 0;

  constructor() {
    super(NotifyScaleBondingProgressPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length > 0) {
      this.progress = payload[0];
    }
  }
}
