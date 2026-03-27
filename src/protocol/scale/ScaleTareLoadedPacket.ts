import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to tare the loaded scale.
 */
export class ScaleTareLoadedPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_TARE_LOADED;
  get opcode() {
    return ScaleTareLoadedPacket.opcode;
  }
  constructor(
    public readonly data: Uint8Array,
    raw?: Uint8Array
  ) {
    super(raw);
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleTareLoadedPacket {
    const data = BoksPacket.extractPayloadData(payload, ScaleTareLoadedPacket.opcode);
    return new ScaleTareLoadedPacket(data, payload);
  }
  toPayload() {
    return this.data;
  }
}
