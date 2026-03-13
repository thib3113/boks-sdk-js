import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';
import { PayloadMapper, PayloadUint24 } from '@/protocol/payload-mapper';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Log: Weight measurement from scale.
 */
export class ScaleMeasureHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_SCALE_MEASURE;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  // We specify length=0 as a wildcard, but the decorator logic currently requires strict length.
  // Instead of full annotation for a dynamic suffix, we map the known part:

  public readonly data: Uint8Array;

  constructor(props: { age: number; data: Uint8Array }, rawPayload?: Uint8Array) {
    super(ScaleMeasureHistoryPacket.opcode, props.age, rawPayload);
    this._age = props.age;
    this.data = props.data;
  }

  static fromPayload(payload: Uint8Array): ScaleMeasureHistoryPacket {
    if (payload.length < 3) {
      throw new BoksProtocolError(BoksProtocolErrorId.MALFORMED_DATA, 'Payload too short');
    }
    const parsed = PayloadMapper.parse(ScaleMeasureHistoryPacket, payload);
    const data = payload.length > 3 ? (payload.subarray(3) as Uint8Array) : EMPTY_BUFFER;
    return new ScaleMeasureHistoryPacket(
      { age: parsed._age as number, data: data as Uint8Array },
      payload
    );
  }
}
