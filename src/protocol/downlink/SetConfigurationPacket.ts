import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode, BoksConfigType } from '@/protocol/constants';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { PayloadUint8, PayloadBoolean, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Set configuration (e.g. La Poste NFC).
 */
export class SetConfigurationPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.SET_CONFIGURATION;

  get opcode() {
    return SetConfigurationPacket.opcode;
  }

  @PayloadUint8(8)
  public accessor configType!: BoksConfigType;

  @PayloadBoolean(9)
  public accessor value!: boolean;

  constructor(configKey: string, configType: BoksConfigType, value: boolean) {
    super(configKey);
    this.configType = configType;
    this.value = value;
  }

  static fromPayload(payload: Uint8Array): SetConfigurationPacket {
    if (payload.length !== 10) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        'SetConfigurationPacket must be exactly 10 bytes long',
        { received: payload.length, expected: 10 }
      );
    }

    const valueByte = payload[9];
    if (valueByte !== 0x00 && valueByte !== 0x01) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_VALUE,
        'SetConfigurationPacket value must be 0x00 or 0x01',
        { received: valueByte }
      );
    }

    const parsed = PayloadMapper.parse(SetConfigurationPacket, payload);
    return new SetConfigurationPacket(parsed.configKey!, parsed.configType!, parsed.value!);
  }

  toPayload() {
    return PayloadMapper.serialize(this);
  }
}
