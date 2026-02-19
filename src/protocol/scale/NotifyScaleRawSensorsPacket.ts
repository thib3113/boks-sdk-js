import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale raw sensors data.
 */
export class NotifyScaleRawSensorsPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_RAW_SENSORS;

  constructor(
    public readonly data: Uint8Array = new Uint8Array(0),
    rawPayload?: Uint8Array
  ) {
    super(NotifyScaleRawSensorsPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleRawSensorsPacket {
    return new NotifyScaleRawSensorsPacket(payload, payload);
  }
}
