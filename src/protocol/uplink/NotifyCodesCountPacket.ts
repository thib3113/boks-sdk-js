import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint16, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Notification of active code counts.
 */
export class NotifyCodesCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODES_COUNT;

  @PayloadUint16(0)
  public accessor masterCount!: number;

  @PayloadUint16(2)
  public accessor otherCount!: number;

  constructor(props: { masterCount: number; otherCount: number }, rawPayload?: Uint8Array) {
    super(NotifyCodesCountPacket.opcode, rawPayload);
    this.masterCount = props.masterCount;
    this.otherCount = props.otherCount;
  }

  static fromPayload(payload: Uint8Array): NotifyCodesCountPacket {
    const parsed = PayloadMapper.parse(NotifyCodesCountPacket, payload);
    const packet = new NotifyCodesCountPacket(
      {
        masterCount: parsed.masterCount!,
        otherCount: parsed.otherCount!
      },
      payload
    );

    return packet;
  }
}
