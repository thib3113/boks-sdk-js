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
  static fromPayload(_payload: Uint8Array): AskDoorStatusPacket {
    return new AskDoorStatusPacket();
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
