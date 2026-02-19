import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding forget success.
 */
export class NotifyScaleBondingForgetSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_FORGET_SUCCESS;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyScaleBondingForgetSuccessPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleBondingForgetSuccessPacket {
    return new NotifyScaleBondingForgetSuccessPacket(payload);
  }
}
