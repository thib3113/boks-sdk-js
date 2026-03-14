import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint8, PayloadMapper } from '@/protocol/payload-mapper';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding progress.
 */
export class NotifyScaleBondingProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS;

  @PayloadUint8(0)
  public accessor progress: number = 0;

  constructor(progress: number, rawPayload?: Uint8Array) {
    super(NotifyScaleBondingProgressPacket.opcode, rawPayload);
    this.progress = progress;
  }

  static fromPayload(payload: Uint8Array): NotifyScaleBondingProgressPacket {
    const data = PayloadMapper.parse(NotifyScaleBondingProgressPacket, payload);
    return new NotifyScaleBondingProgressPacket(data.progress as number, payload);
  }
}
