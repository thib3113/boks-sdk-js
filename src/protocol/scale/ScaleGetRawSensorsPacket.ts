import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to get raw sensor data from the scale.
 * (UNTESTED)
 */
export class ScaleGetRawSensorsPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.SCALE_GET_RAW_SENSORS;
  get opcode() {
    return ScaleGetRawSensorsPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): ScaleGetRawSensorsPacket {
    return new ScaleGetRawSensorsPacket();
  }
  toPayload() {
    return new Uint8Array(0);
  }
}
