import { PayloadMapper } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Door Closed event.
 */
export class DoorCloseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_CLOSE;
  public readonly status = 'closed';

  constructor(age: number, rawPayload?: Uint8Array) {
    super(DoorCloseHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): DoorCloseHistoryPacket {
    const data = PayloadMapper.parse(DoorCloseHistoryPacket, payload);
    return new DoorCloseHistoryPacket(data.age as number, payload);
  }
}
