import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale bonding forget success.
 */
export class NotifyScaleBondingForgetSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_FORGET_SUCCESS;
  constructor() {
    super(NotifyScaleBondingForgetSuccessPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);}
}

