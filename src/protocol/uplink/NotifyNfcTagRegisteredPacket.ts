import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: NFC Tag registered successfully.
 */
export class NotifyNfcTagRegisteredPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_REGISTERED;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyNfcTagRegisteredPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagRegisteredPacket {
    return new NotifyNfcTagRegisteredPacket(payload);
  }
}
