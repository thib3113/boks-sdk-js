import { PayloadMapper, PayloadBoolean } from '@/protocol/payload-mapper';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current door status.
 */
export interface NotifyDoorStatusPacketProps {
  inverted: boolean;
  raw: boolean;
}

export class NotifyDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_DOOR_STATUS;

  @PayloadBoolean(0)
  public accessor inverted!: boolean;

  @PayloadBoolean(1)
  public accessor raw!: boolean;

  public get isOpen(): boolean {
    return this.raw === true && this.inverted === false;
  }

  constructor(props: NotifyDoorStatusPacketProps, rawPayload?: Uint8Array) {
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
