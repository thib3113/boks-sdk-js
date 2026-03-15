import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadNfcUid } from '@/protocol/payload-mapper';

/**
 * NFC Tag Registration.
 */
export interface NfcRegisterPacketProps extends AuthPacketProps {
  uid: string;
}

export class NfcRegisterPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.REGISTER_NFC_TAG;
  get opcode() {
    return NfcRegisterPacket.opcode;
  }

  @PayloadNfcUid(8)
  public accessor uid!: string;

  constructor(props: NfcRegisterPacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.uid = props.uid;
  }

  static fromPayload(payload: Uint8Array): NfcRegisterPacket {
    const data = PayloadMapper.parse(NfcRegisterPacket, payload);
    return new NfcRegisterPacket(data as unknown as NfcRegisterPacketProps, payload);
  }

  toPayload() {
    return PayloadMapper.serialize(this);
  }
}
