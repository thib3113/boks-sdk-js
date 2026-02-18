import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Response to ASK_DOOR_STATUS: Current door state.
 */
export class AnswerDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ANSWER_DOOR_STATUS;
  public isOpen: boolean = false;

  constructor() {
    super(AnswerDoorStatusPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length >= 2) {
      // Logic: isOpen if Raw == 0x01 and Inverted == 0x00
      this.isOpen = payload[1] === 0x01 && payload[0] === 0x00;
    }
  }
}


