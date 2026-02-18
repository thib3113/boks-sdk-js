import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power Off event.
 */
export class PowerOffHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_OFF;
  public reason: number = 0;

  constructor() {
    super(PowerOffHistoryPacket.opcode);
  }

  parse(payload: Uint8Array) {
    const offset = super.parse(payload);
    if (payload.length > offset) {
      this.reason = payload[offset];
    }
  }
}


