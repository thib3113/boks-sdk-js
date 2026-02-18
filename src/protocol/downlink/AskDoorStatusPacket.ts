import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to request current door status.
 */
export class AskDoorStatusPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.ASK_DOOR_STATUS;
  get opcode() {
    return AskDoorStatusPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
