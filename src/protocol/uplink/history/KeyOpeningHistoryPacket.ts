import { BoksPacketOptions } from '../../_BoksPacketBase';
import { PayloadMapper } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Opening with physical key.
 */
export class KeyOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_KEY_OPENING;

  constructor(props: BoksHistoryEventProps, raw?: Uint8Array) {
    super(KeyOpeningHistoryPacket.opcode, props, raw);
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): KeyOpeningHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(
      KeyOpeningHistoryPacket,
      payload,
      options
    );
    return new KeyOpeningHistoryPacket(data, payload);
  }
}
