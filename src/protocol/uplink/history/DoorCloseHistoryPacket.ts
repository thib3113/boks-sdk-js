import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Door Closed event.
 */
export class DoorCloseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_CLOSE;
  public readonly status = 'closed';

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(DoorCloseHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): DoorCloseHistoryPacket {
    let age = 0;
    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
    return new DoorCloseHistoryPacket(age, payload);
  }
}
