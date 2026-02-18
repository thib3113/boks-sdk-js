import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification that the opening code is valid.
 */
export class ValidOpenCodePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.VALID_OPEN_CODE;
  constructor() {
    super(ValidOpenCodePacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);}
}

