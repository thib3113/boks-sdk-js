import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/**
 * Set configuration (e.g. La Poste NFC).
 */
export class SetConfigurationPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.SET_CONFIGURATION;

  get opcode() {
    return SetConfigurationPacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly configType: number,
    public readonly value: boolean
  ) {
    super(configKey);
  }

  static fromPayload(payload: Uint8Array): SetConfigurationPacket {
    if (payload.length !== 10) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        'SetConfigurationPacket must be exactly 10 bytes long',
        { received: payload.length, expected: 10 }
      );
    }

    const configKey = AuthPacket.extractConfigKey(payload);
    const configType = payload[8];
    const valueByte = payload[9];

    if (valueByte !== 0x00 && valueByte !== 0x01) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_VALUE,
        'SetConfigurationPacket value must be 0x00 or 0x01',
        { received: valueByte }
      );
    }

    return new SetConfigurationPacket(configKey, configType, valueByte === 0x01);
  }

  toPayload() {
    const payload = new Uint8Array(8 + 2);
    payload.set(stringToBytes(this.configKey), 0);
    payload[8] = this.configType;
    payload[9] = this.value ? 0x01 : 0x00;
    return payload;
  }
}
