import { PayloadMapper } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Door Closed event.
 */
export class DoorCloseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_CLOSE;
  public readonly status = 'closed';

  constructor(props: BoksHistoryEventProps, rawPayload?: Uint8Array) {
    super(DoorCloseHistoryPacket.opcode, props, rawPayload);
  }

  static fromPayload(payload: Uint8Array): DoorCloseHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(DoorCloseHistoryPacket, payload);
    return new DoorCloseHistoryPacket(data, payload);
  }
}
