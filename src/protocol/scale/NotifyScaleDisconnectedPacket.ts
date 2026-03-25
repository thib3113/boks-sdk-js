import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale disconnected.
 */
export class NotifyScaleDisconnectedPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_DISCONNECTED;

  constructor(raw?: Uint8Array) {
    super(NotifyScaleDisconnectedPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): NotifyScaleDisconnectedPacket {
    return new NotifyScaleDisconnectedPacket(payload);
  }
}
