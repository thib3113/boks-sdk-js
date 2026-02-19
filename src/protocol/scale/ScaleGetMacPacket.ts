import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to get the scale's MAC address.
 */
export class ScaleGetMacPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS;
  get opcode() {
    return ScaleGetMacPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): ScaleGetMacPacket {
    return new ScaleGetMacPacket();
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
