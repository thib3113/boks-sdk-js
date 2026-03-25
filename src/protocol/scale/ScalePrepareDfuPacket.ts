import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to prepare the scale for DFU.
 */
export class ScalePrepareDfuPacket extends BoksPacket {
    constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.SCALE_PREPARE_DFU;
  get opcode() {
    return ScalePrepareDfuPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScalePrepareDfuPacket {
    return new ScalePrepareDfuPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
