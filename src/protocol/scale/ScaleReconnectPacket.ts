import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to request the scale to reconnect.
 */
export class ScaleReconnectPacket extends BoksPacket {
  constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.SCALE_RECONNECT;
  get opcode() {
    return ScaleReconnectPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleReconnectPacket {
    return new ScaleReconnectPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
