import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer, readPinFromBuffer, writePinToBuffer } from '@/utils/converters';

/**
 * Command to create a single-use code.
 */
export class CreateSingleUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_SINGLE_USE_CODE;
  get opcode() {
    return CreateSingleUseCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly pin: string
  ) {
    super(configKey);
    this.pin = this.formatPin(pin);
  }

  static fromPayload(payload: Uint8Array): CreateSingleUseCodePacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    const pin = readPinFromBuffer(payload, 8);
    return new CreateSingleUseCodePacket(configKey, pin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 6);
    writeConfigKeyToBuffer(payload, 0, this.configKey);

    writePinToBuffer(payload, 8, this.pin);

    return payload;
  }
}
