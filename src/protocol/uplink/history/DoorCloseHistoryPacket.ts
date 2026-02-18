import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Door Closed event.
 */
export class DoorCloseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_CLOSE;
  public readonly status = 'closed';

  constructor() {
    super(DoorCloseHistoryPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
