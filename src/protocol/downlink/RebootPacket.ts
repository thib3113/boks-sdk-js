import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to reboot the Boks.
 */
export class RebootPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.REBOOT;
  get opcode() {
    return RebootPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
