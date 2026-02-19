import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: History Erased event.
 */
export class HistoryEraseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_HISTORY_ERASE;
  constructor() {
    super(HistoryEraseHistoryPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
