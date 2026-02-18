import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale bonding success.
 */
export class NotifyScaleBondingSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_SUCCESS;
  constructor() {
    super(NotifyScaleBondingSuccessPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);}
}

