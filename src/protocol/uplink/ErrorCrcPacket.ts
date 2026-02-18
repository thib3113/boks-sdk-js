import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: CRC mismatch.
 */
export class ErrorCrcPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_CRC;
  constructor() {
    super(ErrorCrcPacket.opcode);
  }
  parse() {}
}


