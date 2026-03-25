import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to get the number of active codes.
 */
export class CountCodesPacket extends BoksPacket {
    constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.COUNT_CODES;
  get opcode() {
    return CountCodesPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): CountCodesPacket {
    return new CountCodesPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
