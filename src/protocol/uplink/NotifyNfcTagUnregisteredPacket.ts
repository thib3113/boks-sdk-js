import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: NFC Tag unregistered successfully.
 */
export class NotifyNfcTagUnregisteredPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED;
  constructor() {
    super(NotifyNfcTagUnregisteredPacket.opcode);
  }
  parse() {}
}


