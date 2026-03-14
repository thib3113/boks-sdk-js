import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: System Error event.
 */
export class ErrorHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_ERROR;

  public readonly errorCode: number;

  constructor(props: { age: number; errorCode: number }, rawPayload?: Uint8Array) {
    super(ErrorHistoryPacket.opcode, props.age, rawPayload);
    this.errorCode = props.errorCode;
  }

  static fromPayload(payload: Uint8Array): ErrorHistoryPacket {
    let age = 0;
    let errorCode = 0;

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    const offset = 3;
    if (payload.length > offset) {
      errorCode = payload[offset];
    }
    return new ErrorHistoryPacket({ age, errorCode }, payload);
  }
}
