import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';
import { validatePinCode } from '@/utils/pin';

/**
 * Command to delete a multi-use code.
 */
export class DeleteMultiUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_MULTI_USE_CODE;
  get opcode() {
    return DeleteMultiUseCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly pin: string
  ) {
    super(configKey);
    validatePinCode(pin);
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
