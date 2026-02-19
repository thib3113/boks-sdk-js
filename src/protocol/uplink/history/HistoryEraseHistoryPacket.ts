import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: History Erased event.
 */
export class HistoryEraseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_HISTORY_ERASE;

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(HistoryEraseHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): HistoryEraseHistoryPacket {
    let age = 0;
    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
    return new HistoryEraseHistoryPacket(age, payload);
  }
}
