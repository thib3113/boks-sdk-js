import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Error: NFC Tag already registered during registration process.
 */
export class NotifyNfcTagRegisteredErrorAlreadyExistsPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS;
  constructor() {
    super(NotifyNfcTagRegisteredErrorAlreadyExistsPacket.opcode);
  }
  parse() {}
}


