import { PayloadMapper } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: History Erased event.
 */
export class HistoryEraseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_HISTORY_ERASE;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(HistoryEraseHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): HistoryEraseHistoryPacket {
    const data = PayloadMapper.parse(HistoryEraseHistoryPacket, payload);
    return new HistoryEraseHistoryPacket(data.age as number, payload);
  }
}
