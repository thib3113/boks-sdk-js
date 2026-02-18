import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale weight measurement.
 */
export class NotifyScaleMeasureWeightPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT;
  public weight: number = 0;

  constructor() {
    super(NotifyScaleMeasureWeightPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length >= 4) {
      // Assuming 32-bit float or integer, doc says [DATA]
      // Let's store raw for now or assume int if we have more info
      this.weight = (payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3];
    }
  }
}
