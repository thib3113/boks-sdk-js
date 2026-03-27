import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadProgress } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding progress.
 */
export class NotifyScaleBondingProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS;

  @PayloadProgress(0)
  public accessor progress!: number;

  constructor(progress: number, raw?: Uint8Array) {
    super(NotifyScaleBondingProgressPacket.opcode, raw);
    this.progress = progress;
  }

  static fromRaw(
    payload: Uint8Array,
    options?: BoksPacketOptions
  ): NotifyScaleBondingProgressPacket {
    const data = PayloadMapper.parse(NotifyScaleBondingProgressPacket, payload, options);
    return new NotifyScaleBondingProgressPacket(data.progress, payload);
  }
}
