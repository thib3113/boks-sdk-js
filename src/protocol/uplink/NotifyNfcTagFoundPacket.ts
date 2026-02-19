import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

/**
 * Notification: NFC Tag found during scan.
 */
export class NotifyNfcTagFoundPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_FOUND;
  public uid: string = '';
  public readonly status = 'found';

  constructor() {
    super(NotifyNfcTagFoundPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    this.uid = bytesToHex(payload);
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {
    const packet = new NotifyNfcTagFoundPacket();
    packet.parse(payload);
    return packet;
  }
}
