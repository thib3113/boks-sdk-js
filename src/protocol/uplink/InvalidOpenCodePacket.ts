import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification that the opening code is invalid.
 */
export class InvalidOpenCodePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.INVALID_OPEN_CODE;

  constructor(raw?: Uint8Array) {
    super(InvalidOpenCodePacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): InvalidOpenCodePacket {
    return new InvalidOpenCodePacket(payload);
  }
}
