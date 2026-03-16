import { PayloadMapper, PayloadUint8 } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding progress.
 */
export class NotifyScaleBondingProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS;

  @PayloadUint8(0)
  public accessor progress!: number;

  constructor(progress: number, rawPayload?: Uint8Array) {
    super(NotifyScaleBondingProgressPacket.opcode, rawPayload);
    this.progress = progress;
  }

  static fromPayload(payload: Uint8Array): NotifyScaleBondingProgressPacket {
    const data = PayloadMapper.parse<Record<string, unknown>>(
      NotifyScaleBondingProgressPacket,
      payload
    );
    return new NotifyScaleBondingProgressPacket(data.progress, payload);
  }
}
