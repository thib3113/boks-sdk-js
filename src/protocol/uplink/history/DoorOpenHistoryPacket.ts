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

  #parsedAge: number = 0;

  @PayloadUint24(0)
  public get parsedAge(): number {
    return this.#parsedAge;
  }
  public set parsedAge(value: number) {
    this.#parsedAge = value;
  }

  constructor(props: DoorOpenHistoryPacketProps) {
    super(DoorOpenHistoryPacket.opcode, props.age, props.rawPayload);
    this.parsedAge = props.age;
    PayloadMapper.validate(this);
  }

  static fromPayload(payload: Uint8Array): DoorOpenHistoryPacket {
    if (payload.length < 3) {
      return new DoorOpenHistoryPacket({ age: 0, rawPayload: payload });
    }
    const data = PayloadMapper.parse(DoorOpenHistoryPacket, payload);
    return new DoorOpenHistoryPacket({ age: data.parsedAge as number, rawPayload: payload });
  }
}
