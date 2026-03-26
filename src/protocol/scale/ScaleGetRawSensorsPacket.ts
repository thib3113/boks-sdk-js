import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to get raw sensor data from the scale.
 */
export class ScaleGetRawSensorsPacket extends BoksPacket {
  constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.SCALE_GET_RAW_SENSORS;
  get opcode() {
    return ScaleGetRawSensorsPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ScaleGetRawSensorsPacket {
    return new ScaleGetRawSensorsPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
