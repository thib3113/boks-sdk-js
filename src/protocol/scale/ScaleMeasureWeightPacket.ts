import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to request a weight measurement.
 */
export class ScaleMeasureWeightPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_MEASURE_WEIGHT;
  get opcode() {
    return ScaleMeasureWeightPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): ScaleMeasureWeightPacket {
    return new ScaleMeasureWeightPacket();
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
