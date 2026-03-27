import { PayloadMapper, PayloadVarLenHex } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: NFC Tag found during scan.
 */
export class NotifyNfcTagFoundPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_FOUND;
  public readonly status = 'found';

  @PayloadVarLenHex(0)
  public accessor uid!: string;

  constructor(uid: string, rawPayload?: Uint8Array) {
    super(NotifyNfcTagFoundPacket.opcode, rawPayload);
    this.uid = uid;
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {
    const data = PayloadMapper.parse<NotifyNfcTagFoundPacket>(NotifyNfcTagFoundPacket, payload);
    return new NotifyNfcTagFoundPacket(data.uid, payload);
  }
}
