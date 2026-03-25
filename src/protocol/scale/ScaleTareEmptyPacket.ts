import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to tare the empty scale.
 */
export class ScaleTareEmptyPacket extends BoksPacket {
    constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.SCALE_TARE_EMPTY;
  get opcode() {
    return ScaleTareEmptyPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleTareEmptyPacket {
    return new ScaleTareEmptyPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
