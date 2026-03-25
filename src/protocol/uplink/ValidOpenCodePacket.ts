import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification that the opening code is valid.
 */
export class ValidOpenCodePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.VALID_OPEN_CODE;

  constructor(raw?: Uint8Array) {
    super(ValidOpenCodePacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ValidOpenCodePacket {
    return new ValidOpenCodePacket(payload);
  }
}
