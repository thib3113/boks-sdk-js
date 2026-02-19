import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Opening with physical key.
 */
export class KeyOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_KEY_OPENING;

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(KeyOpeningHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): KeyOpeningHistoryPacket {
    let age = 0;
    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
    return new KeyOpeningHistoryPacket(age, payload);
  }
}
