import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale raw sensors data.
 */
export class NotifyScaleRawSensorsPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_RAW_SENSORS;

  constructor(
    public readonly data: Uint8Array = EMPTY_BUFFER,
    rawPayload?: Uint8Array
  ) {
    super(NotifyScaleRawSensorsPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleRawSensorsPacket {
    return new NotifyScaleRawSensorsPacket(payload, payload);
  }
}
