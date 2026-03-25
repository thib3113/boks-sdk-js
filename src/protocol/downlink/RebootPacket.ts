import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to reboot the Boks.
 */
export class RebootPacket extends BoksPacket {
    constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.REBOOT;
  get opcode() {
    return RebootPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): RebootPacket {
    return new RebootPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
