import { PayloadMapper, PayloadVarLenHex } from '@/protocol/payload-mapper';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: NFC Tag found during scan.
 */
export interface NotifyNfcTagFoundPacketProps {
  uid: string;
}

export class NotifyNfcTagFoundPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_FOUND;
  public readonly status = 'found';

  @PayloadVarLenHex(0)
  public accessor uid!: string;

  constructor(props: NotifyNfcTagFoundPacketProps, rawPayload?: Uint8Array) {
    super(NotifyNfcTagFoundPacket.opcode, rawPayload);
    this.uid = props.uid;
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {
    const packet = new NotifyNfcTagFoundPacket(
      {
        uid: PayloadMapper.parse<NotifyNfcTagFoundPacketProps>(NotifyNfcTagFoundPacket, payload)
          .uid!
      },
      payload
    );

    return packet;
  }
}
