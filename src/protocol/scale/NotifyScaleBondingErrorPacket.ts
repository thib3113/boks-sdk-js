import { PayloadMapper, PayloadUint8 } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale bonding error.
 */
export class NotifyScaleBondingErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_BONDING_ERROR;

  @PayloadUint8(0)
  public accessor errorCode!: number;

  constructor(errorCode: number, raw?: Uint8Array) {
    super(NotifyScaleBondingErrorPacket.opcode, raw);
    this.errorCode = errorCode;
  }

  static fromRaw(payload: Uint8Array): NotifyScaleBondingErrorPacket {
    const data = PayloadMapper.parse(NotifyScaleBondingErrorPacket, payload);
    return new NotifyScaleBondingErrorPacket(data.errorCode, payload);
  }
}
