import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: Power On event.
 * (UNTESTED)
 */
export class PowerOnHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_ON;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(PowerOnHistoryPacket.opcode, age, rawPayload);
    this._age = age;
  }

  static fromPayload(payload: Uint8Array): PowerOnHistoryPacket {
    const data = PayloadMapper.parse(PowerOnHistoryPacket, payload);
    return new PowerOnHistoryPacket(data._age as number, payload);
  }
}
