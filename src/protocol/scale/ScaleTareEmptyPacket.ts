import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to tare the empty scale.
 * (UNTESTED)
 */
export class ScaleTareEmptyPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_TARE_EMPTY;
  get opcode() {
    return ScaleTareEmptyPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
