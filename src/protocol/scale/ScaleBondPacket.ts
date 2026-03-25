import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to bond with the scale.
 */
export class ScaleBondPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_BOND;
  get opcode() {
    return ScaleBondPacket.opcode;
  }
  constructor(
    public readonly data: Uint8Array,
    raw?: Uint8Array
  ) {
    super(raw);
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleBondPacket {
    const data = BoksPacket.extractPayloadData(payload, ScaleBondPacket.opcode);
    return new ScaleBondPacket(data, payload);
  }
  toPayload() {
    return this.data;
  }
}
