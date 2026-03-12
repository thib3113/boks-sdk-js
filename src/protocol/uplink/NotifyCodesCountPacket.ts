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

  constructor(masterCount: number, otherCount: number, rawPayload?: Uint8Array) {
    super(NotifyCodesCountPacket.opcode, rawPayload);
    this.masterCount = masterCount;
    this.otherCount = otherCount;
  }

  static fromPayload(payload: Uint8Array): NotifyCodesCountPacket {
    const parsed = PayloadMapper.parse(NotifyCodesCountPacket, payload);
    return new NotifyCodesCountPacket(parsed.masterCount!, parsed.otherCount!, payload);
  }
}
