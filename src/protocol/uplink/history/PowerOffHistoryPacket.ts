import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24, PayloadUint8, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: Power Off event.
 */
export class PowerOffHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_OFF;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  @PayloadUint8(3)
  public accessor reason: number = 0;

  constructor(props: { age: number; reason: number }, rawPayload?: Uint8Array) {
    super(PowerOffHistoryPacket.opcode, props.age, rawPayload);
    this._age = props.age;
    this.reason = props.reason;
  }

  static fromPayload(payload: Uint8Array): PowerOffHistoryPacket {
    const data = PayloadMapper.parse(PowerOffHistoryPacket, payload);
    return new PowerOffHistoryPacket(
      { age: data._age as number, reason: data.reason as number },
      payload
    );
  }
}
