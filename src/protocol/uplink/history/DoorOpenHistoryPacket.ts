import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadUint24 } from '@/protocol/payload-mapper';

export interface DoorOpenHistoryPacketProps {
  age: number;
  rawPayload?: Uint8Array;
}

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
  // Instead, we leave it as parsedAge, or map it using a dummy property and assign it to the base.
  @PayloadUint24(0)
  public accessor _age: number = 0;

  constructor(props: DoorOpenHistoryPacketProps) {
    super(DoorOpenHistoryPacket.opcode, props.age, props.rawPayload);
    this._age = props.age;
  }

  static fromPayload(payload: Uint8Array): DoorOpenHistoryPacket {
    if (payload.length < 3) {
      return new DoorOpenHistoryPacket({ age: 0, rawPayload: payload });
    }
    const data = PayloadMapper.parse(DoorOpenHistoryPacket, payload);
    return new DoorOpenHistoryPacket({ age: data._age as number, rawPayload: payload });
  }
}
