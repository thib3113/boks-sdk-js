import { PayloadMapper } from '@/protocol/decorators';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadNfcUid } from '@/protocol/decorators';

/**
 * Command to unregister an NFC tag.
 */
export interface UnregisterNfcTagPacketProps extends AuthPacketProps {
  uid: string;
}

export class UnregisterNfcTagPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.UNREGISTER_NFC_TAG;
  get opcode() {
    return UnregisterNfcTagPacket.opcode;
  }

  @PayloadNfcUid(8)
  public accessor uid!: string;

  constructor(props: UnregisterNfcTagPacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.uid = props.uid;
  }

  static fromPayload(payload: Uint8Array): UnregisterNfcTagPacket {
    const data = PayloadMapper.parse<UnregisterNfcTagPacketProps>(UnregisterNfcTagPacket, payload);
    return new UnregisterNfcTagPacket(data, payload);
  }
}
