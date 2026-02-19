import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: Bad request.
 */
export class ErrorBadRequestPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_BAD_REQUEST;
  constructor() {
    super(ErrorBadRequestPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);}
}

