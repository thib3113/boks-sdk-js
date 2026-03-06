import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, bytesToString, writePinToBuffer } from '@/utils/converters';
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
    const configKey = AuthPacket.extractConfigKey(payload);
    const pin = bytesToString(payload.subarray(8, 14));
    return new SingleToMultiCodePacket(configKey, pin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 6);
    payload.set(stringToBytes(this.configKey), 0);

    writePinToBuffer(payload, 8, this.pin);

    return payload;
  }
}
