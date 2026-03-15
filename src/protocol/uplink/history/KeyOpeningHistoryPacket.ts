import { PayloadMapper } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Opening with physical key.
 */
export class KeyOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_KEY_OPENING;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(KeyOpeningHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): KeyOpeningHistoryPacket {
    const data = PayloadMapper.parse(KeyOpeningHistoryPacket, payload);
    return new KeyOpeningHistoryPacket(data.age as number, payload);
  }
}
