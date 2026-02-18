import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power On event.
 * (UNTESTED)
 */
export class PowerOnHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_ON;
  constructor() {
    super(PowerOnHistoryPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
