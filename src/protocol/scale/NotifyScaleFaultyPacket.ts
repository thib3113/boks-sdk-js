import { PayloadMapper, PayloadByteArray } from '@/protocol/payload-mapper';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale faulty.
 */
export class NotifyScaleFaultyPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_FAULTY;

  @PayloadByteArray(0)
  public accessor data!: Uint8Array;

  constructor(data: Uint8Array, rawPayload?: Uint8Array) {
    super(NotifyScaleFaultyPacket.opcode, rawPayload);
    this.data = data;
  }

  static fromPayload(payload: Uint8Array): NotifyScaleFaultyPacket {
    const data = PayloadMapper.parse(NotifyScaleFaultyPacket, payload);
    return new NotifyScaleFaultyPacket(data.data as Uint8Array, payload);
  }
}
