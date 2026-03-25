import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: Unauthorized action.
 */
export class ErrorUnauthorizedPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_UNAUTHORIZED;

  constructor(raw?: Uint8Array) {
    super(ErrorUnauthorizedPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ErrorUnauthorizedPacket {
    return new ErrorUnauthorizedPacket(payload);
  }
}
