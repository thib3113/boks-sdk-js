import { BoksPacketOptions } from '../../_BoksPacketBase';
import { PayloadMapper } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: History Erased event.
 */
export class HistoryEraseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_HISTORY_ERASE;

  constructor(props: BoksHistoryEventProps, raw?: Uint8Array) {
    super(HistoryEraseHistoryPacket.opcode, props, raw);
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): HistoryEraseHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(
      HistoryEraseHistoryPacket,
      payload,
      options
    );
    return new HistoryEraseHistoryPacket(data, payload);
  }
}
