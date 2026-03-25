import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to get the scale's MAC address.
 */
export class ScaleGetMacPacket extends BoksPacket {
    constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS;
  get opcode() {
    return ScaleGetMacPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleGetMacPacket {
    return new ScaleGetMacPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
