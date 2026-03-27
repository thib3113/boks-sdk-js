import { PayloadMapper, PayloadUint8, PayloadBoolean } from '@/protocol/decorators';
import { BoksPacket, BoksPacketOptions } from '@/protocol/_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode, BoksConfigType } from '@/protocol/constants';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/**
 * Set configuration (e.g. La Poste NFC).
 */
export interface SetConfigurationPacketProps extends AuthPacketProps {
  configType: BoksConfigType;
  value: boolean;
}

export class SetConfigurationPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.SET_CONFIGURATION;

  get opcode() {
    return SetConfigurationPacket.opcode;
  }

  @PayloadUint8(8)
  public accessor configType!: BoksConfigType;

  @PayloadBoolean(9)
  public accessor value!: boolean;

  constructor(props: SetConfigurationPacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.configType = props.configType;
    this.value = props.value;
  }

  static fromRaw(raw: Uint8Array, options?: BoksPacketOptions): SetConfigurationPacket {
    const payload = BoksPacket.extractPayloadData(raw, SetConfigurationPacket.opcode);
    if (payload.length !== 10) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        'SetConfigurationPacket must be exactly 10 bytes long',
        { received: payload.length, expected: 10 }
      );
    }

    const parsed = PayloadMapper.parse<SetConfigurationPacketProps>(
      SetConfigurationPacket,
      payload,
      options
    );
    return new SetConfigurationPacket(parsed, payload);
  }
}
