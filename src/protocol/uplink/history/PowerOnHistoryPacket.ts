import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power On event.
 * (UNTESTED)
 */
export class PowerOnHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_ON;

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(PowerOnHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): PowerOnHistoryPacket {
    let age = 0;
    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
    return new PowerOnHistoryPacket(age, payload);
  }
}
