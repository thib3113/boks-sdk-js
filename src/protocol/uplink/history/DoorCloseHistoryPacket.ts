import { BoksPacketOptions } from '../../_BoksPacketBase';
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

  constructor(props: BoksHistoryEventProps, raw?: Uint8Array) {
    super(DoorCloseHistoryPacket.opcode, props, raw);
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): DoorCloseHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(
      DoorCloseHistoryPacket,
      payload,
      options
    );
    return new DoorCloseHistoryPacket(data, payload);
  }
}
