import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to prepare the scale for DFU.
 * (UNTESTED)
 */
export class ScalePrepareDfuPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_PREPARE_DFU;
  get opcode() {
    return ScalePrepareDfuPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
