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

  constructor(
    props: { configKey: string; configType: BoksConfigType; value: boolean },
    rawPayload?: Uint8Array
  ) {
    super(props.configKey, rawPayload);
    this.configType = props.configType;
    this.value = props.value;
  }

  static fromPayload(payload: Uint8Array): SetConfigurationPacket {
    if (payload.length !== 10) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        'SetConfigurationPacket must be exactly 10 bytes long',
        { received: payload.length, expected: 10 }
      );
    }

    const parsed = PayloadMapper.parse(SetConfigurationPacket, payload);
    return new SetConfigurationPacket({
      configKey: parsed.configKey!,
      configType: parsed.configType!,
      value: parsed.value!
    });
  }

  toPayload() {
    return PayloadMapper.serialize(this);
  }
}
