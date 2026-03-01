import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, bytesToString } from '@/utils/converters';
import { validatePinCode } from '@/utils/validation';

/**
 * Command to convert a Single-Use code to Multi-Use.
 */
export class SingleToMultiCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.SINGLE_USE_CODE_TO_MULTI;
  get opcode() {
    return SingleToMultiCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly pin: string
  ) {
    super(configKey);
    validatePinCode(pin);
  }

  static fromPayload(payload: Uint8Array): SingleToMultiCodePacket {
    const configKey = bytesToString(payload.subarray(0, 8));
    const pin = bytesToString(payload.subarray(8, 14));
    return new SingleToMultiCodePacket(configKey, pin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 6);
    payload.set(stringToBytes(this.configKey), 0);

    const pinBytes = stringToBytes(this.pin);
    const fixedPin = new Uint8Array(6);
    fixedPin.set(pinBytes.subarray(0, 6));
    payload.set(fixedPin, 8);

    return payload;
  }
}
