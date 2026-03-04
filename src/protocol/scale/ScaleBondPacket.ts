import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to bond with the scale.
 */
export class ScaleBondPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_BOND;
  get opcode() {
    return ScaleBondPacket.opcode;
  }
  constructor(public readonly data: Uint8Array = EMPTY_BUFFER) {
    super();
  }
  static fromPayload(payload: Uint8Array): ScaleBondPacket {
    return new ScaleBondPacket(payload);
  }
  toPayload() {
    return this.data;
  }
}
