import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadVarLenHex, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Notification: NFC Tag found during scan.
 */
export class NotifyNfcTagFoundPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_FOUND;
  public readonly status = 'found';

  @PayloadVarLenHex(0)
  public accessor uid!: string;

  constructor(props: { uid: string }, rawPayload?: Uint8Array) {
    super(NotifyNfcTagFoundPacket.opcode, rawPayload);
    this.uid = props.uid;
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {
    const packet = new NotifyNfcTagFoundPacket(
      {
        uid: PayloadMapper.parse(NotifyNfcTagFoundPacket, payload).uid!
      },
      payload
    );

    return packet;
  }
}
