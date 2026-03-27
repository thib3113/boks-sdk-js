import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: Bad request.
 */
export class ErrorBadRequestPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_BAD_REQUEST;

  constructor(rawPayload?: Uint8Array) {
    super(ErrorBadRequestPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): ErrorBadRequestPacket {
    return new ErrorBadRequestPacket(payload);
  }
}
