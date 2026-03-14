import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: Opening with physical key.
 */
export class KeyOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_KEY_OPENING;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(KeyOpeningHistoryPacket.opcode, age, rawPayload);
    this._age = age;
  }

  static fromPayload(payload: Uint8Array): KeyOpeningHistoryPacket {
    const data = PayloadMapper.parse(KeyOpeningHistoryPacket, payload);
    return new KeyOpeningHistoryPacket(data._age as number, payload);
  }
}
