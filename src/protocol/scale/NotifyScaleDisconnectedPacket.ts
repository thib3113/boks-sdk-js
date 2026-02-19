import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale disconnected.
 */
export class NotifyScaleDisconnectedPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_DISCONNECTED;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyScaleDisconnectedPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleDisconnectedPacket {
    return new NotifyScaleDisconnectedPacket(payload);
  }
}
