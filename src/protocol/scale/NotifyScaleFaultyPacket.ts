import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale faulty.
 */
export class NotifyScaleFaultyPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_FAULTY;

  constructor(
    public readonly data: Uint8Array = new Uint8Array(0),
    rawPayload?: Uint8Array
  ) {
    super(NotifyScaleFaultyPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleFaultyPacket {
    return new NotifyScaleFaultyPacket(payload, payload);
  }
}
