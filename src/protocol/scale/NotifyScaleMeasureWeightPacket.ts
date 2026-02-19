import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale weight measurement.
 */
export class NotifyScaleMeasureWeightPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT;

  constructor(
    public readonly weight: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(NotifyScaleMeasureWeightPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleMeasureWeightPacket {
    let weight = 0;
    if (payload.length >= 4) {
      weight = (payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3];
    }
    return new NotifyScaleMeasureWeightPacket(weight, payload);
  }
}
