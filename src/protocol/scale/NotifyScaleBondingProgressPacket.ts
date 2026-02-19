import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding progress.
 */
export class NotifyScaleBondingProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS;

  constructor(
    public readonly progress: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(NotifyScaleBondingProgressPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleBondingProgressPacket {
    let progress = 0;
    if (payload.length > 0) {
      progress = payload[0];
    }
    return new NotifyScaleBondingProgressPacket(progress, payload);
  }
}
