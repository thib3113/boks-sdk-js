import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power Off event.
 */
export class PowerOffHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_OFF;

  public readonly reason: number;

  constructor(props: { age: number; reason: number }, rawPayload?: Uint8Array) {
    super(PowerOffHistoryPacket.opcode, props.age, rawPayload);
    this.reason = props.reason;
  }

  static fromPayload(payload: Uint8Array): PowerOffHistoryPacket {
    let age = 0;
    let reason = 0;

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    if (payload.length > 3) {
      reason = payload[3];
    }
    return new PowerOffHistoryPacket({ age: age as number, reason: reason as number }, payload);
  }
}
