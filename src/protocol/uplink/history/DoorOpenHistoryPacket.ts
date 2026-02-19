import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Door Open event.
 */
export class DoorOpenHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_DOOR_OPEN;
  public readonly status = 'open';

  constructor() {
    super(DoorOpenHistoryPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
  }

  static fromPayload(payload: Uint8Array): DoorOpenHistoryPacket {
    const packet = new DoorOpenHistoryPacket();
    packet.parse(payload);
    return packet;
  }
}
