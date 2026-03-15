import { PayloadMapper } from '@/protocol/payload-mapper';
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

  constructor(props: BoksHistoryEventProps, rawPayload?: Uint8Array) {
    super(KeyOpeningHistoryPacket.opcode, props, rawPayload);
  }

  static fromPayload(payload: Uint8Array): KeyOpeningHistoryPacket {
    const data = PayloadMapper.parse(KeyOpeningHistoryPacket, payload);
    return new KeyOpeningHistoryPacket({ age: data.age as number }, payload);
  }
}
