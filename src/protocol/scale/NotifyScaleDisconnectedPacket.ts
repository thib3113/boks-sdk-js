import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
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
