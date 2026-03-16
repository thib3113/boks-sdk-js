import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper } from '@/protocol/decorators';

/**
 * Log: Door Open event.
 */
export class DoorOpenHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_OPEN;
  public readonly status = 'open';

  // In TS decorators on accessors when the property shares a name with a getter from base class
  // can cause "Cannot write to private field" if the compiler tries to create a conflicting backing field.
  // In `BoksHistoryEvent`, `age` is a `public readonly age: number`.
  // We cannot override `readonly` with `accessor` gracefully in this V8/TS build context without shadowing errors.
  // Instead, we leave it as _age, or map it using a dummy property and assign it to the base.
  constructor(props: BoksHistoryEventProps, rawPayload?: Uint8Array) {
    super(DoorOpenHistoryPacket.opcode, props, rawPayload);
  }

  static fromPayload(payload: Uint8Array): DoorOpenHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(DoorOpenHistoryPacket, payload);
    return new DoorOpenHistoryPacket(data, payload);
  }
}
