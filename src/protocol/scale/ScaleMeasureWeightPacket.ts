import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to request a weight measurement.
 * (UNTESTED)
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
