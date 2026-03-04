import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to reboot the Boks.
 */
export class RebootPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.REBOOT;
  get opcode() {
    return RebootPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): RebootPacket {
    return new RebootPacket();
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
