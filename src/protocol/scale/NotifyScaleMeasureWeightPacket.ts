import { PayloadMapper, PayloadBoolean, PayloadUint24 } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale weight measurement.
 */
export class NotifyScaleMeasureWeightPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT;

  @PayloadBoolean(0)
  public accessor signNegative!: boolean;

  @PayloadUint24(1)
  public accessor absWeight!: number;

  public get weight(): number {
    return (this.signNegative ? -1 : 1) * this.absWeight;
  }

  constructor(weight: number, rawPayload?: Uint8Array) {
    super(NotifyScaleMeasureWeightPacket.opcode, rawPayload);
    this.signNegative = weight < 0;
    this.absWeight = Math.abs(weight);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleMeasureWeightPacket {
    const data = PayloadMapper.parse<Record<string, unknown>>(
      NotifyScaleMeasureWeightPacket,
      payload
    );
    return new NotifyScaleMeasureWeightPacket(
      (data.signNegative ? -1 : 1) * (data.absWeight as number),
      payload
    );
  }
}
