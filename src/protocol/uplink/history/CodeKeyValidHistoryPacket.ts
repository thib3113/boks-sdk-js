import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToString } from '@/utils/converters';

/**
 * Log: Successful Key code usage (Physical keypad).
 */
export class CodeKeyValidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_KEY_VALID;

  constructor(
    age: number = 0,
    public readonly code: string = '',
    rawPayload?: Uint8Array
  ) {
    super(CodeKeyValidHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): CodeKeyValidHistoryPacket {
    let age = 0;
    let code = '';

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    const offset = 3;
    if (payload.length >= offset + 6) {
      code = bytesToString(payload.slice(offset, offset + 6));
    }
    return new CodeKeyValidHistoryPacket(age, code, payload);
  }
}
