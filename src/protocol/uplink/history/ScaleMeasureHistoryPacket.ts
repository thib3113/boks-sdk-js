import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Log: Weight measurement from scale.
 */
export class ScaleMeasureHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_SCALE_MEASURE;

  constructor(
    age: number = 0,
    public readonly data: Uint8Array = EMPTY_BUFFER,
    rawPayload?: Uint8Array
  ) {
    super(ScaleMeasureHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): ScaleMeasureHistoryPacket {
    let age = 0;
    let data: Uint8Array = EMPTY_BUFFER;

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    if (payload.length > 3) {
      data = payload.subarray(3) as Uint8Array;
    }
    return new ScaleMeasureHistoryPacket(age, data, payload);
  }
}
