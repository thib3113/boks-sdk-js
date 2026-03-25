import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadBoolean } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current door status.
 */
export interface NotifyDoorStatusPacketProps {
  inverted: boolean;
  status: boolean;
}

export class NotifyDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_DOOR_STATUS;

  @PayloadBoolean(0)
  public accessor inverted!: boolean;

  @PayloadBoolean(1)
  public accessor status!: boolean;

  public get isOpen(): boolean {
    return this.status === true && this.inverted === false;
  }

  constructor(props: NotifyDoorStatusPacketProps, raw?: Uint8Array) {
    super(NotifyDoorStatusPacket.opcode, raw);
    this.inverted = props.inverted;
    this.status = props.status;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): NotifyDoorStatusPacket {
    const data = PayloadMapper.parse<NotifyDoorStatusPacketProps>(NotifyDoorStatusPacket, payload, options);
    return new NotifyDoorStatusPacket(data, payload);
  }
}
