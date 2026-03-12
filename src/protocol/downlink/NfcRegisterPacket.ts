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

  constructor(configKey: string, uid: string) {
    super(configKey);
    this.uid = this.formatNfcUid(uid);
  }

  static fromPayload(payload: Uint8Array): NfcRegisterPacket {
    if (payload.length < 8) {
      return new NfcRegisterPacket('', ''); // invalid payload, let generic validation fail or construct empty
    }
    const parsed = PayloadMapper.parse(NfcRegisterPacket, payload);
    return new NfcRegisterPacket(parsed.configKey!, parsed.uid!);
  }

  toPayload() {
    return PayloadMapper.serialize(this);
  }
}
