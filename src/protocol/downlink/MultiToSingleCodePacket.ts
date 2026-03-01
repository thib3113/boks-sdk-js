import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, bytesToString } from '@/utils/converters';
import { validatePinCode } from '@/utils/validation';

/**
 * Command to convert a Multi-Use code to Single-Use.
 */
export class MultiToSingleCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.MULTI_CODE_TO_SINGLE_USE;
  get opcode() {
    return MultiToSingleCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly pin: string
  ) {
    super(configKey);
    validatePinCode(pin);
  }

  static fromPayload(payload: Uint8Array): MultiToSingleCodePacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    const pin = bytesToString(payload.subarray(8, 14));
    return new MultiToSingleCodePacket(configKey, pin);
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
