import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
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
      // payload[0] ? -1 : 1
      const sign = payload[0] !== 0 ? -1 : 1;
      // payload[1] << 16 | payload[2] << 8 | payload[3]
      const val = (payload[1] << 16) | (payload[2] << 8) | payload[3];
      weight = sign * val;
    }
    return new NotifyScaleMeasureWeightPacket(weight, payload);
  }
}
