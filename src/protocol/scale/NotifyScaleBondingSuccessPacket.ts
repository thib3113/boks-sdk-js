import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding success.
 */
export class NotifyScaleBondingSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_SUCCESS;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyScaleBondingSuccessPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleBondingSuccessPacket {
    return new NotifyScaleBondingSuccessPacket(payload);
  }
}
