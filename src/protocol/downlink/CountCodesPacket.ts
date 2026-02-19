import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to get the number of active codes.
 */
export class CountCodesPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.COUNT_CODES;
  get opcode() {
    return CountCodesPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): CountCodesPacket {
    return new CountCodesPacket();
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
