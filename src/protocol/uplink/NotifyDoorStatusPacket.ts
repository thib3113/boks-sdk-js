import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint8, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Notification of the current door status.
 */
export class NotifyDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_DOOR_STATUS;

  @PayloadUint8(0)
  public accessor inverted!: number;

  @PayloadUint8(1)
  public accessor raw!: number;

  public get isOpen(): boolean {
    return this.raw === 0x01 && this.inverted === 0x00;
  }

  constructor(props: { inverted: number; raw: number }, rawPayload?: Uint8Array) {
    super(NotifyDoorStatusPacket.opcode, rawPayload);
    this.inverted = props.inverted;
    this.raw = props.raw;
  }

  static fromPayload(payload: Uint8Array): NotifyDoorStatusPacket {
    const parsed = PayloadMapper.parse(NotifyDoorStatusPacket, payload);
    const packet = new NotifyDoorStatusPacket(
      { inverted: parsed.inverted!, raw: parsed.raw! },
      payload
    );

    return packet;
  }
}
