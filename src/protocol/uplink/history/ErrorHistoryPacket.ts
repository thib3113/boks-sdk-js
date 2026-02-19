import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: System Error event.
 */
export class ErrorHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_ERROR;

  constructor(
    age: number = 0,
    public readonly errorCode: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(ErrorHistoryPacket.opcode, age, rawPayload);
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
    return new ErrorHistoryPacket(age, errorCode, payload);
  }
}
