import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to request a weight measurement.
 */
export class ScaleMeasureWeightPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_MEASURE_WEIGHT;
  get opcode() {
    return ScaleMeasureWeightPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleMeasureWeightPacket {
    return new ScaleMeasureWeightPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
