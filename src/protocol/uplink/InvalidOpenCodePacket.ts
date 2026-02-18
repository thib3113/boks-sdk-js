import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification that the opening code is invalid.
 */
export class InvalidOpenCodePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.INVALID_OPEN_CODE;
  constructor() {
    super(InvalidOpenCodePacket.opcode);
  }
  parse() {}
}
