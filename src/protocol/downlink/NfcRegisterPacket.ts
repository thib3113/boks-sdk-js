import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadVarLenHex } from '@/protocol/payload-mapper';

/**
 * NFC Tag Registration.
 */
export class NfcRegisterPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.REGISTER_NFC_TAG;
  get opcode() {
    return NfcRegisterPacket.opcode;
  }

  @PayloadVarLenHex(8)
  public accessor uid!: string;

  constructor(props: { configKey: string; uid: string }) {
    super(props.configKey);
    this.uid = this.formatNfcUid(props.uid);
  }

  static fromPayload(payload: Uint8Array): NfcRegisterPacket {
    const parsed = PayloadMapper.parse(NfcRegisterPacket, payload);
    return new NfcRegisterPacket({ configKey: parsed.configKey!, uid: parsed.uid! });
  }

  toPayload() {
    return PayloadMapper.serialize(this);
  }
}
