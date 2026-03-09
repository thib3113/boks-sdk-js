import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadUint24 } from '@/protocol/payload-mapper';

/**
 * Log: Door Open event.
 */
export class DoorOpenHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_OPEN;
  public readonly status = 'open';

  @PayloadUint24(0)
  public readonly parsedAge: number;

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(DoorOpenHistoryPacket.opcode, age, rawPayload);
    this.parsedAge = age;
  }

  static fromPayload(payload: Uint8Array): DoorOpenHistoryPacket {
    // History events with 0 bytes have a default age of 0
    // Legacy implementation was: if (payload.length >= 3) age = payload[0...]; return new(age, payload)
    // So lengths 0, 1, 2 also result in age 0.
    if (payload.length < 3) {
      return new DoorOpenHistoryPacket(0, payload);
    }
    const data = PayloadMapper.parse(DoorOpenHistoryPacket, payload);
    return new DoorOpenHistoryPacket(data.parsedAge!, payload);
  }
}
