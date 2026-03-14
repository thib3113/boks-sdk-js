import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadUint24 } from '@/protocol/payload-mapper';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

export interface DoorOpenHistoryPacketProps {
  age: number;
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
  // Instead, we leave it as _age, or map it using a dummy property and assign it to the base.
  @PayloadUint24(0)
  public accessor _age: number = 0;

  constructor(props: DoorOpenHistoryPacketProps, rawPayload?: Uint8Array) {
    super(DoorOpenHistoryPacket.opcode, props.age, rawPayload);
    this._age = props.age;
  }

  static fromPayload(payload: Uint8Array): DoorOpenHistoryPacket {
    if (payload.length < 3) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'Payload too short to contain age'
      );
    }
    const data = PayloadMapper.parse(DoorOpenHistoryPacket, payload);
    return new DoorOpenHistoryPacket({ age: data._age as number }, payload);
  }
}
