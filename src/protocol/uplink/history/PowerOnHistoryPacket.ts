import { PayloadMapper } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power On event.
 * (UNTESTED)
 */
export class PowerOnHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_ON;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(PowerOnHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): PowerOnHistoryPacket {
    const data = PayloadMapper.parse(PowerOnHistoryPacket, payload);
    return new PowerOnHistoryPacket(data.age as number, payload);
  }
}
