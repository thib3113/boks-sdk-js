import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale tare loaded OK.
 */
export class NotifyScaleTareLoadedOkPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_TARE_LOADED_OK;

  constructor(raw?: Uint8Array) {
    super(NotifyScaleTareLoadedOkPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): NotifyScaleTareLoadedOkPacket {
    return new NotifyScaleTareLoadedOkPacket(payload);
  }
}
