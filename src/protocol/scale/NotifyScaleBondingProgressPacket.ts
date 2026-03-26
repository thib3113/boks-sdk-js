import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadUint8 } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding progress.
 */
export class NotifyScaleBondingProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS;

  @PayloadUint8(0)
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

    // Add validation for progress to be strictly <= 100
    if (data.progress > 100) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_VALUE,
        'Bonding progress cannot exceed 100%',
        { progress: data.progress }
      );
    }

    return new NotifyScaleBondingProgressPacket(data.progress, payload);
  }
}
