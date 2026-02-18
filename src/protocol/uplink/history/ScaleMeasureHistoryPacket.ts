import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Weight measurement from scale.
 */
export class ScaleMeasureHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_SCALE_MEASURE;
  public data: Uint8Array = new Uint8Array(0);

  constructor() {
    super(ScaleMeasureHistoryPacket.opcode);
  }

  parse(payload: Uint8Array) {
    const offset = super.parse(payload);
    this.data = payload.slice(offset);
  }
}
