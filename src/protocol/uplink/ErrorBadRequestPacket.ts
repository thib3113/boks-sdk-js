import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: Bad request.
 */
export class ErrorBadRequestPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_BAD_REQUEST;

  constructor(raw?: Uint8Array) {
    super(ErrorBadRequestPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ErrorBadRequestPacket {
    return new ErrorBadRequestPacket(payload);
  }
}
