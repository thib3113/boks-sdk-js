import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: NFC Tag registered successfully.
 */
export class NotifyNfcTagRegisteredPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_REGISTERED;

  constructor(raw?: Uint8Array) {
    super(NotifyNfcTagRegisteredPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): NotifyNfcTagRegisteredPacket {
    return new NotifyNfcTagRegisteredPacket(payload);
  }
}
