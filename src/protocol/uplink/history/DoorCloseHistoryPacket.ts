import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: Door Closed event.
 */
export class DoorCloseHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_CLOSE;
  public readonly status = 'closed';

  @PayloadUint24(0)
  public accessor _age: number = 0;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(DoorCloseHistoryPacket.opcode, age, rawPayload);
    this._age = age;
  }

  static fromPayload(payload: Uint8Array): DoorCloseHistoryPacket {
    const data = PayloadMapper.parse(DoorCloseHistoryPacket, payload);
    return new DoorCloseHistoryPacket(data._age as number, payload);
  }
}
