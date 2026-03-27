import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadUint16, PacketDescriptor } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of active code counts.
 */
export interface NotifyCodesCountPacketProps {
  masterCount: number;
  otherCount: number;
}

@PacketDescriptor({ lengthIncludesHeader: true })
export class NotifyCodesCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODES_COUNT;

  @PayloadUint16(0)
  public accessor masterCount!: number;

  @PayloadUint16(2)
  public accessor otherCount!: number;

  constructor(props: NotifyCodesCountPacketProps, raw?: Uint8Array) {
    super(NotifyCodesCountPacket.opcode, raw);
    this.masterCount = props.masterCount;
    this.otherCount = props.otherCount;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): NotifyCodesCountPacket {
    const data = PayloadMapper.parse<NotifyCodesCountPacketProps>(
      NotifyCodesCountPacket,
      payload,
      options
    );
    return new NotifyCodesCountPacket(data, payload);
  }
}
