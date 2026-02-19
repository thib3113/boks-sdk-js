import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power Off event.
 */
export class PowerOffHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_OFF;

  constructor(
    age: number = 0,
    public readonly reason: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(PowerOffHistoryPacket.opcode, age, rawPayload);
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
    return new PowerOffHistoryPacket(age, reason, payload);
  }
}
