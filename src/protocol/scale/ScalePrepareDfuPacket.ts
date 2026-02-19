import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to prepare the scale for DFU.
 */
export class ScalePrepareDfuPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_PREPARE_DFU;
  get opcode() {
    return ScalePrepareDfuPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): ScalePrepareDfuPacket {
    return new ScalePrepareDfuPacket();
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
