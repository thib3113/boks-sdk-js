import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: Unauthorized action.
 */
export class ErrorUnauthorizedPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_UNAUTHORIZED;

  constructor(rawPayload?: Uint8Array) {
    super(ErrorUnauthorizedPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): ErrorUnauthorizedPacket {
    return new ErrorUnauthorizedPacket(payload);
  }
}
