import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';

/**
 * Command to create a multi-use code.
 */
export class CreateMultiUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_MULTI_USE_CODE;
  get opcode() {
    return CreateMultiUseCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly pin: string
  ) {
    super(configKey);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 6);
    payload.set(stringToBytes(this.configKey), 0);

    const pinBytes = stringToBytes(this.pin);
    const fixedPin = new Uint8Array(6);
    fixedPin.set(pinBytes.slice(0, 6));
    payload.set(fixedPin, 8);

    return payload;
  }
}


