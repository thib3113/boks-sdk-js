import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to forget the bonded scale.
 */
export class ScaleForgetPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_FORGET_BONDING;
  get opcode() {
    return ScaleForgetPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleForgetPacket {
    return new ScaleForgetPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
