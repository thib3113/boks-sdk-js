import { PayloadMapper, PayloadByteArray } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale raw sensors data.
 */
export class NotifyScaleRawSensorsPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_RAW_SENSORS;

  @PayloadByteArray(0)
  public accessor data!: Uint8Array;

  constructor(data: Uint8Array, raw?: Uint8Array) {
    super(NotifyScaleRawSensorsPacket.opcode, raw);
    this.data = data;
  }

  static fromRaw(payload: Uint8Array): NotifyScaleRawSensorsPacket {
    const data = PayloadMapper.parse(NotifyScaleRawSensorsPacket, payload);
    return new NotifyScaleRawSensorsPacket(data.data, payload);
  }
}
