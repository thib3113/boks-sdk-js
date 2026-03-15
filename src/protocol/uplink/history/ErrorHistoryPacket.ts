import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24, PayloadUint8, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: System Error event.
 */
export class ErrorHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_ERROR;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  @PayloadUint8(3)
  public accessor errorCode: number = 0;

  constructor(props: { age: number; errorCode: number }, rawPayload?: Uint8Array) {
    super(ErrorHistoryPacket.opcode, props.age, rawPayload);
    this._age = props.age;
    this.errorCode = props.errorCode;
  }

  static fromPayload(payload: Uint8Array): ErrorHistoryPacket {
    const data = PayloadMapper.parse(ErrorHistoryPacket, payload);
    return new ErrorHistoryPacket(
      { age: data._age as number, errorCode: data.errorCode as number },
      payload
    );
  }
}
