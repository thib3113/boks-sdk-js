import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to request the scale to reconnect.
 * (UNTESTED)
 */
export class ScaleReconnectPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_RECONNECT;
  get opcode() {
    return ScaleReconnectPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): ScaleReconnectPacket {
    return new ScaleReconnectPacket();
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
