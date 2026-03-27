import { BoksPacketOptions } from '../_BoksPacketBase';
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

  constructor(uid: string, raw?: Uint8Array) {
    super(NotifyNfcTagFoundPacket.opcode, raw);
    this.uid = uid;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): NotifyNfcTagFoundPacket {
    const data = PayloadMapper.parse<NotifyNfcTagFoundPacket>(
      NotifyNfcTagFoundPacket,
      payload,
      options
    );
    return new NotifyNfcTagFoundPacket(data.uid, payload);
  }
}
