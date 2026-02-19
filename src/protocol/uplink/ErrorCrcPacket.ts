import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Protocol Error: CRC mismatch.
 */
export class ErrorCrcPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_CRC;

  constructor(rawPayload?: Uint8Array) {
    super(ErrorCrcPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): ErrorCrcPacket {
    return new ErrorCrcPacket(payload);
  }
}
