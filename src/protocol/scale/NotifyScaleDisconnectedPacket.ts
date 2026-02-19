import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale disconnected.
 */
export class NotifyScaleDisconnectedPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_DISCONNECTED;
  constructor() {
    super(NotifyScaleDisconnectedPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
