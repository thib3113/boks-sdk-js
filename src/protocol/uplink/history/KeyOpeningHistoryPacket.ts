import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Opening with physical key.
 */
export class KeyOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_KEY_OPENING;
  constructor() {
    super(KeyOpeningHistoryPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
