import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to bond with the scale.
 * (UNTESTED)
 */
export class ScaleBondPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_BOND;
  get opcode() {
    return ScaleBondPacket.opcode;
  }
  constructor(public readonly data: Uint8Array = new Uint8Array(0)) {
    super();
  }
  static fromPayload(payload: Uint8Array): ScaleBondPacket {
    return new ScaleBondPacket(payload);
  }
  toPayload() {
    return this.data;
  }
}
