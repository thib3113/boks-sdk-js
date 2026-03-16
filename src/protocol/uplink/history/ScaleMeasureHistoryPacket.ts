import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadByteArray } from '@/protocol/decorators';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Log: Weight measurement from scale.
 */
export interface ScaleMeasureHistoryPacketProps extends BoksHistoryEventProps {
  data: Uint8Array;
}

export class ScaleMeasureHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_SCALE_MEASURE;

  // We specify length=0 as a wildcard, but the decorator logic currently requires strict length.
  // Instead of full annotation for a dynamic suffix, we map the known part:

  @PayloadByteArray(3)
  public accessor data!: Uint8Array;

  constructor(props: ScaleMeasureHistoryPacketProps, rawPayload?: Uint8Array) {
    super(ScaleMeasureHistoryPacket.opcode, props, rawPayload);
    this.data = props.data;
  }

  static fromPayload(payload: Uint8Array): ScaleMeasureHistoryPacket {
    const data = PayloadMapper.parse<ScaleMeasureHistoryPacketProps>(
      ScaleMeasureHistoryPacket,
      payload
    );
    return new ScaleMeasureHistoryPacket(
      {
        age: data._age,
        data: payload.length > 3 ? payload.subarray(3) : new Uint8Array(0)
      },
      payload
    );
  }
}
