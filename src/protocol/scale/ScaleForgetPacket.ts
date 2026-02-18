import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to forget the bonded scale.
 * (UNTESTED)
 */
export class ScaleForgetPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_FORGET_BONDING;
  get opcode() {
    return ScaleForgetPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
