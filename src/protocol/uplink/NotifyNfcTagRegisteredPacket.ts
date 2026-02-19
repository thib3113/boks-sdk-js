import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: NFC Tag registered successfully.
 */
export class NotifyNfcTagRegisteredPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_REGISTERED;
  constructor() {
    super(NotifyNfcTagRegisteredPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagRegisteredPacket {
    const packet = new NotifyNfcTagRegisteredPacket();
    packet.parse(payload);
    return packet;
  }
}
