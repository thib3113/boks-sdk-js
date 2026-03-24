import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to request current door status.
 */
export class AskDoorStatusPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.ASK_DOOR_STATUS;
  get opcode() {
    return AskDoorStatusPacket.opcode;
  }
  static fromRaw(payload: Uint8Array): AskDoorStatusPacket {
    return new AskDoorStatusPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
