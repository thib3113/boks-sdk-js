import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadNfcUid } from '@/protocol/decorators';

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

  constructor(props: NfcRegisterPacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.uid = props.uid;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): NfcRegisterPacket {
    const data = PayloadMapper.parse<NfcRegisterPacketProps>(NfcRegisterPacket, payload, options);
    return new NfcRegisterPacket(data, payload);
  }

  toPayload() {
    return PayloadMapper.serialize(this);
  }
}
