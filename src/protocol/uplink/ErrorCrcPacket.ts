import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: CRC mismatch.
 */
export class ErrorCrcPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_CRC;

  constructor(raw?: Uint8Array) {
    super(ErrorCrcPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ErrorCrcPacket {
    return new ErrorCrcPacket(payload);
  }
}
