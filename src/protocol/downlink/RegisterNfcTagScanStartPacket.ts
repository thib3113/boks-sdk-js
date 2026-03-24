import { PayloadMapper, PayloadConfigKey } from '@/protocol/decorators';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to start NFC tag scanning for registration.
 */
export class RegisterNfcTagScanStartPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.REGISTER_NFC_TAG_SCAN_START;
  get opcode() {
    return RegisterNfcTagScanStartPacket.opcode;
  }

  @PayloadConfigKey(1)
  public accessor configKey!: string;

  constructor(configKey: string, raw?: Uint8Array) {
    super(raw);
    this.configKey = configKey;
  }

  static fromRaw(raw: Uint8Array): RegisterNfcTagScanStartPacket {
    const payload = BoksPacket.extractPayloadData(raw, RegisterNfcTagScanStartPacket.opcode);
    let parsePayload = payload;
    if (payload.length === 8) {
      parsePayload = new Uint8Array([0, ...payload]);
    }

    const data = PayloadMapper.parse<RegisterNfcTagScanStartPacket>(
      RegisterNfcTagScanStartPacket,
      parsePayload
    );
    return new RegisterNfcTagScanStartPacket(data.configKey, payload);
  }
}
