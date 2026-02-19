import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: Unauthorized action.
 */
export class ErrorUnauthorizedPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_UNAUTHORIZED;
  constructor() {
    super(ErrorUnauthorizedPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);}
}

