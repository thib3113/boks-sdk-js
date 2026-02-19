import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

/**
 * Notification: NFC Tag found during scan.
 */
export class NotifyNfcTagFoundPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_FOUND;
  public readonly status = 'found';

  constructor(
    public readonly uid: string = '',
    rawPayload?: Uint8Array
  ) {
    super(NotifyNfcTagFoundPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {
    const uid = bytesToHex(payload);
    return new NotifyNfcTagFoundPacket(uid, payload);
  }
}
