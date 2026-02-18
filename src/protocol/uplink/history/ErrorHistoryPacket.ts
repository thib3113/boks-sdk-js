import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: System Error event.
 * (UNTESTED)
 */
export class ErrorHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_ERROR;
  public errorCode: number = 0;

  constructor() {
    super(ErrorHistoryPacket.opcode);
  }

  parse(payload: Uint8Array) {
    this.parseHistoryHeader(payload);
    const offset = 3;
    if (payload.length > offset) {
      this.errorCode = payload[offset];
    }
  }
}
