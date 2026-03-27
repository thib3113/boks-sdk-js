import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification that the opening code is invalid.
 */
export class InvalidOpenCodePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.INVALID_OPEN_CODE;

  constructor(rawPayload?: Uint8Array) {
    super(InvalidOpenCodePacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): InvalidOpenCodePacket {
    return new InvalidOpenCodePacket(payload);
  }
}
