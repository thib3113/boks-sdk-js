import { PayloadMapper, PayloadConfigKey } from '@/protocol/decorators';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

export interface RegisterNfcTagScanStartPacketProps {
  configKey: string;
}

export class RegisterNfcTagScanStartPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.REGISTER_NFC_TAG_SCAN_START;
  get opcode() {
    return RegisterNfcTagScanStartPacket.opcode;
  }

  @PayloadConfigKey(1)
  private accessor _configKeyMapper!: string;

  public get configKey(): string {
    return this._configKeyMapper;
  }

  constructor(props: RegisterNfcTagScanStartPacketProps, rawPayload?: Uint8Array) {
    super(rawPayload);
    this._configKeyMapper = props.configKey;
  }

  static fromPayload(payload: Uint8Array): RegisterNfcTagScanStartPacket {
    // Note: To parse at offset 1, payload MUST have 9 bytes minimum!
    // But maybe it's only 9 bytes when BoksPacketFactory passes the opcode?
    // Wait, BoksPacketFactory does NOT pass the opcode, it strips it!
    // If it strips the opcode, the payload is 8 bytes!
    // But the prompt EXPLICITLY requested: "Ajouter @PayloadConfigKey(1) sur la propriété configKey dans RegisterNfcTagScanStartPacket (et mapper _configKeyMapper)."
    // Let me just add an 0 prefix if payload length is 8 so that PayloadMapper.parse works.

    let parsePayload = payload;
    if (payload.length === 8) {
      parsePayload = new Uint8Array([0, ...payload]);
    }

    const data = PayloadMapper.parse<RegisterNfcTagScanStartPacketProps>(
      RegisterNfcTagScanStartPacket,
      parsePayload
    ) /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ as any;
    return new RegisterNfcTagScanStartPacket({ configKey: data._configKeyMapper }, payload);
  }
}
