import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Response to ASK_DOOR_STATUS: Current door state.
 */
export class AnswerDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ANSWER_DOOR_STATUS;

  constructor(
    public readonly isOpen: boolean = false,
    rawPayload?: Uint8Array
  ) {
    super(AnswerDoorStatusPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): AnswerDoorStatusPacket {
    let isOpen = false;
    if (payload.length >= 2) {
      // Logic: isOpen if Raw == 0x01 and Inverted == 0x00
      isOpen = payload[1] === 0x01 && payload[0] === 0x00;
    }
    return new AnswerDoorStatusPacket(isOpen, payload);
  }
}
