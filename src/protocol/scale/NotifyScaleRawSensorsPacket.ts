import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Scale raw sensors data.
 */
export class NotifyScaleRawSensorsPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_RAW_SENSORS;
  public data: Uint8Array = new Uint8Array(0);

  constructor() {
    super(NotifyScaleRawSensorsPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    this.data = payload;
  }
}


