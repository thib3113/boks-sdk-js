import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { readPinFromBuffer } from '@/utils/converters';

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
      code = readPinFromBuffer(payload, offset);
    }
    return new CodeKeyValidHistoryPacket(age, code, payload);
  }
}
