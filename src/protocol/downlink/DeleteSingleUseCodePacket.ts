import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, bytesToString } from '@/utils/converters';
import { validatePinCode } from '@/utils/validation';

/**
 * Command to delete a single-use code by value.
 */
export class DeleteSingleUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_SINGLE_USE_CODE;
  get opcode() {
    return DeleteSingleUseCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly pin: string
  ) {
    super(configKey);
    validatePinCode(pin);
  }

  static fromPayload(payload: Uint8Array): DeleteSingleUseCodePacket {
    const configKey = bytesToString(payload.slice(0, 8));
    const pin = bytesToString(payload.slice(8, 14));
    return new DeleteSingleUseCodePacket(configKey, pin);
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

  toJSON() {
    return {
      ...super.toJSON(),
      pin: '******'
    };
  }
}
