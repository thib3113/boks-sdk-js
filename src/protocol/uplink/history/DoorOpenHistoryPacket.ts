import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Door Open event.
 */
export class DoorOpenHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_OPEN;
  public readonly status = 'open';

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(DoorOpenHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): DoorOpenHistoryPacket {
    let age = 0;
    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
    return new DoorOpenHistoryPacket(age, payload);
  }
}
