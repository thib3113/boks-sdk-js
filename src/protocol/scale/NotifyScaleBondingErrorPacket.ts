import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding error.
 */
export class NotifyScaleBondingErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_ERROR;

  constructor(
    public readonly errorCode: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(NotifyScaleBondingErrorPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleBondingErrorPacket {
    let errorCode = 0;
    if (payload.length > 0) {
      errorCode = payload[0];
    }
    return new NotifyScaleBondingErrorPacket(errorCode, payload);
  }
}
