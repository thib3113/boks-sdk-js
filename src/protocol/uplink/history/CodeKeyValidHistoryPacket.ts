import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToString } from '@/utils/converters';

/**
 * Log: Successful Key code usage (Physical keypad).
 */
export class CodeKeyValidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_KEY_VALID;
  public code: string = '';

  constructor() {
    super(CodeKeyValidHistoryPacket.opcode);
  }

  parse(payload: Uint8Array): void {
    this.parseHistoryHeader(payload); const offset = 3;
    if (payload.length >= offset + 6) {
      this.code = bytesToString(payload.slice(offset, offset + 6));
    }
  }
}

