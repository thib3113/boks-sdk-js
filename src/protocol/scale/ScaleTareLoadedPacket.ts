import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to tare the loaded scale.
 * (UNTESTED)
 */
export class ScaleTareLoadedPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_TARE_LOADED;
  get opcode() {
    return ScaleTareLoadedPacket.opcode;
  }
  constructor(public readonly data: Uint8Array = new Uint8Array(0)) {
    super();
  }
  static fromPayload(payload: Uint8Array): ScaleTareLoadedPacket {
    return new ScaleTareLoadedPacket(payload);
  }
  toPayload() {
    return this.data;
  }
}
