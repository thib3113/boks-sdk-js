import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: NFC Tag unregistered successfully.
 */
export class NotifyNfcTagUnregisteredPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyNfcTagUnregisteredPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagUnregisteredPacket {
    return new NotifyNfcTagUnregisteredPacket(payload);
  }
}
